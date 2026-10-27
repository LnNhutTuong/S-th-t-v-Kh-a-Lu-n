import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { AuthUser } from '../auth/types/jwt-payload.type.js';
import { Prisma } from '../generated/prisma/client.js';
import { TaskQueryDTO } from './dto/task-query.dto.js';
import { WorkflowService } from '../workflow/workflow.service.js';
import { PermissionService } from '../permission/permission.service.js';
import { PERMISSION_KEYS, ROLE_KEY_DEFAULT, ROLE_RANK } from '../permission/constants/pemission.constants.js';

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService, private readonly workflowService: WorkflowService, private readonly permissionService: PermissionService) {}

  async findAll(user: AuthUser, query: TaskQueryDTO) {
      const page = query.page  ?? 1;
      const limit = query.limit ?? 10;
      const skip = (page - 1 ) * limit;

      const isSuperAdmin = await this.permissionService.isSuperAdmin(user.id);

      const managedWorkspaceIds = (await this.prisma.workspaceMember.findMany({
        where: {
          userId: user.id,
          deletedAt: null,
          role: { key: { in: [ROLE_KEY_DEFAULT.OWNER, ROLE_KEY_DEFAULT.WORKSPACE_MANAGER] } } },
        select: { workspaceId: true },
      })).map((m) => m.workspaceId);

      const where: Prisma.TaskWhereInput = {
        deletedAt: null,
        ...(isSuperAdmin ? {} : { OR: [
          { project: { members: { some: { userId: user.id, deletedAt: null } } } },
          { projectId: null, workspace: { members: { some: { userId: user.id, deletedAt: null } } } },
          { workspaceId: { in: managedWorkspaceIds } },
        ] }),
      };

      if(query.parentId !== undefined){
        where.parentId = query.parentId
      }else{
        where.parentId = null
      }

      if(query.projectId){
        where.projectId = query.projectId;
      }

      if(query.status){
        where.status = query.status
      }

      if(query.priority){
        where.priority = query.priority
      }

      if(query.dueDate){
        const start = new Date(query.dueDate);
        const nextDay = new Date(query.dueDate)

        start.setHours(0,0,0,0);
        nextDay.setDate(nextDay.getDate()+1)
        nextDay.setHours(0,0,0,0)

        where.dueDate ={
          gte: start,
          lt: nextDay
        }
      }

      if(query.search){
        where.title ={
          contains: query.search,
          mode: 'insensitive'
        }
      }

      const [tasks, total] = await Promise.all([
        this.prisma.task.findMany({
          where, skip, take: limit, orderBy:{
            [query.sortBy ?? "createdAt"]: query.sortOrder ?? "desc"
          },
          omit:{formulaId:true, projectId: true, createdById: true, parentId:true },
          include: {
            formula:{
              select:{
                id: true, name: true,
              }
            },
            project:{
              select:{
                id: true, name: true
              }
            },
            createdBy:{
              select:{id: true, email: true, name:true}
            },
            taskAssignees:{
              select:{
                user:{
                  select:{
                    id: true, email: true, name:true
                  }
                }
              }
            },
            parentTask:{
              select:{
                id: true, title:true,
              }
            },
            subTasks:{
              select:{
                id: true, title:true,
              },
              orderBy:{
                createdAt: 'asc'
              },
          }}
        }),
        this.prisma.task.count({where})
      ]) 

      return {
        tasks, total, page, limit, totalPages: Math.ceil(total/limit)
      }
  }

  async findOne(id: string, user: AuthUser) {
    const task = await this.prisma.task.findUnique({
      where:{
        id,
        deletedAt: null,
      },
      omit:{formulaId:true, parentId:true },
      include: {
            formula:{
              select:{
                id: true, name: true,
              }
            },
            project:{
              select:{
                id: true, name: true, workspaceId: true, createdById: true, members: true,
              }
            },
            createdBy:{
              select:{id: true, email: true, name:true}
            },
            taskAssignees:{
              select:{
                userId: true,
                user:{
                  select:{
                    id: true, email: true, name:true
                  }
                }
              }
            },
            parentTask:{
              select:{
                id: true, title:true,
              }
            },
            subTasks:{
              select:{
                id: true, title:true,
              },
              orderBy:{
                createdAt: 'asc'
              },
             
            }
          }
    })
    
    if(!task){
      throw new NotFoundException('Task not found');
    }

    //check permission to view
    await this.permissionService.assertPermission(task.workspaceId, user.id, PERMISSION_KEYS.TASK_VIEW, task.project?.id ?? undefined)
    await this.assertCanViewTask(task, user.id)
    
    return task
  }

  async createTask(dto: CreateTaskDto, user: AuthUser) {

    const workspace = await this.prisma.workspace.findUnique({
      where:{
        id: dto.workspaceId,
        deletedAt: null,
      }
    })

    if(!workspace){
      throw new NotFoundException('Workspace not found')
    }

    if(!dto.workspaceId && !dto.projectId){
      throw new BadRequestException('The task need workspaceId or projectId')
    }

    let project = null
    if(dto.projectId){
      project = await this.prisma.project.findFirst({
          where:{
            id: dto.projectId,
          deletedAt: null
        },
        include:{
          members:{
            select:{
              user:{
                select:{
                  id: true, email: true, name: true
                }
              }
            }
          }
        }
      })

      if(!project){
        throw new NotFoundException('Project not found')
      }

      if(project.workspaceId !== workspace.id){
        throw new BadRequestException('Project is not in this workspace')
      }

    }
    

    //check permission to create task
    await this.permissionService.assertPermission(dto.workspaceId, user.id, PERMISSION_KEYS.TASK_CREATE, project?.id)

    if(dto.parentId){
      const parentTask = await this.prisma.task.findFirst({
        where:{
          id: dto.parentId,
          deletedAt: null
        }
      })

      if(!parentTask){
        throw new NotFoundException('Parent task not found')
      }

      if(parentTask.projectId !== dto.projectId){
        throw new BadRequestException('Parent task belongs to a different project')      
      }

      if(parentTask.parentId){
        throw new BadRequestException('Task is already a sub task')
      }
    }

    if(dto.assigneeIds && project){
      const allowedUserIds = [project.createdById, ...project.members.map(m => m.user.id)];
      const isValid = dto.assigneeIds.every(id => allowedUserIds.includes(id));

      if (!isValid) {
        throw new BadRequestException('One or more assignees are not members of this project');
      }
    }

    const task = await this.prisma.task.create({
      data:{
        workspaceId: workspace.id,
        projectId: dto.projectId,
        createdById: user.id,
        title: dto.title.trim(),
        description: dto.description,
        priority: dto.priority,
        status: dto.status ?? 'TODO',
        dueDate: dto.dueDate,
        parentId: dto.parentId,
        customFields: dto.customFields as Prisma.InputJsonValue ?? Prisma.JsonNull,
        taskAssignees: dto.assigneeIds?.length ? {
          create: dto.assigneeIds.map(userId => ({ userId }))
        } : undefined
      }
    })

    return this.findOne(task.id, user);
  }

  async updateTask(id: string, dto: UpdateTaskDto, user: AuthUser) {
    const task = await this.prisma.task.findFirst({
      where:{
        id,
        deletedAt: null,
      },
      include:{
        project:{
          select:{
            id: true, createdById: true, workspaceId: true, members:{
              where: { deletedAt: null },
              select:{
                user:{select:{
                  id: true, email: true, name: true
                }}
              }
            }
          }
        },
        taskAssignees:true

      }
    })

    if(!task){
      throw new NotFoundException('Task not found');
    }

    await this.permissionService.assertPermission(task.workspaceId, user.id, PERMISSION_KEYS.TASK_UPDATE, task.projectId ?? undefined)

    const isAssignee = task.taskAssignees.some(a => a.userId === user.id);
    const hasAssignPerm = await this.permissionService.hasPermission(
      task.workspaceId,
      user.id,
      PERMISSION_KEYS.TASK_ASSIGN,
      task.projectId ?? undefined,
    );

    if (!isAssignee && !hasAssignPerm) {
      throw new ForbiddenException('You do not have permission to update this task');
    }

    if (dto.assigneeIds !== undefined && !hasAssignPerm) {
      throw new ForbiddenException('You do not have permission to change task assignees');
    }

    if(dto.parentId !== task.parentId){
      if(dto.parentId){
        const parentTask = await this.prisma.task.findFirst({
          where:{
            id: dto.parentId
          }
        })
        if(!parentTask){
          throw new NotFoundException('Parent task not found')
        }
        if(parentTask.projectId !== task.projectId){
          throw new BadRequestException('Parent task belongs to a different project')
        }
        if(parentTask.id === task.id){
          throw new BadRequestException('Task cannot be its own parent')
        }
        if(parentTask.parentId){
          throw new BadRequestException(`This task is already a subtask,`
           + `you cannot change it to a parent task`)
        } 
      }
    }

    //check workflow
    if(dto.status && dto.status !== task.status){
      await this.workflowService.assertValidTransition(
        task.workspaceId,
        task.projectId, 
        task.status, //status hien tai
        dto.status! //status cap nhat
      )
    }

    // Kiểm tra dto.assigneeIds hợp lệ trước transaction
    if(dto.assigneeIds){
      const allowedUserIds = task.project ?
        [task.project.createdById, ...task.project.members.map(m => m.user.id)] : 
        [task.createdById];

      const isValid = dto.assigneeIds.every(id => allowedUserIds.includes(id))

      if(!isValid){
        throw new BadRequestException('One or more assignees are not members of this project')
      }
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.task.update({
        where: { id: task.id },
        data: {
          title: dto.title,
          description: dto.description,
          priority: dto.priority,
          status: dto.status,
          dueDate: dto.dueDate,
          parentId: dto.parentId,
          customFields: dto.customFields !== undefined
            ? (dto.customFields as Prisma.InputJsonValue ?? Prisma.JsonNull)
            : undefined,
        },
      });

      if(dto.assigneeIds){
        await tx.taskAssignee.deleteMany({
          where:{
            taskId: task.id
          }
        })

        if(dto.assigneeIds.length > 0){
          await tx.taskAssignee.createMany({
            data: dto.assigneeIds.map(userId => ({
              taskId: task.id, 
              userId
            }))
          })
        }
      }
    });

   

    return this.findOne(task.id, user)
  }

  async deleteTask(id: string, user: AuthUser) {
    const task = await this.prisma.task.findFirst({
      where:{
        id, deletedAt: null,
      },
    })

    if(!task){
      throw new NotFoundException('Task not found')
    }

    await this.permissionService.assertPermission(task.workspaceId, user.id, PERMISSION_KEYS.TASK_DELETE, task.projectId ?? undefined)

   await this.prisma.$transaction(async tx => {
      await tx.task.update({ 
        where: { id: task.id }, 
        data: { deletedAt: new Date() } 
      });
      
      // soft delete đệ quy cho subtask
      await tx.task.updateMany({
        where: { parentId: task.id, deletedAt: null },
        data: { deletedAt: new Date() }
      });
  });

    return true;
  }

  async findAllKeyResultsLinkedToTask(taskId: string, user: AuthUser){
    const task = await this.prisma.task.findUnique({
      where: {  
        id: taskId, deletedAt: null
      },
    select: {
      id: true,
      title: true,
      status: true,
      workspaceId: true,
      projectId: true,
      taskKeyResults: {
        select: {
           keyResult: {
              select: {
                 id: true,
                 title: true,
                 currentValue: true,
                 targetValue: true,
              unit: true,
              },
            },
          },
        },
      },
    });
    
    if(!task){
      throw new NotFoundException('Task not found');
    }

    await this.permissionService.assertPermission(task.workspaceId, user.id, PERMISSION_KEYS.TASK_VIEW_KEYRESULT, task.projectId ?? undefined) 

    const keyResultsLinkedToTask = await this.prisma.task.findUnique({
      where:{
        id: taskId
      },
      
    }) 

    if(!keyResultsLinkedToTask){
      throw new NotFoundException('Task not found')
    }

    return task
  }

  async LinkTaskToKeyResult (taskId: string, keyResultId: string, user: AuthUser){
      const task = await this.prisma.task.findUnique({
        where:{
          id: taskId, deletedAt: null,
        },
      })

      if(!task){
        throw new NotFoundException('Task not found')
      }

      //check permission to link task to key result
      await this.permissionService.assertPermission(task.workspaceId, user.id, PERMISSION_KEYS.TASK_LINK_KEYRESULT, task.projectId ?? undefined)
      
      const keyResult = await this.prisma.keyResult.findUnique({
        where:{
          id: keyResultId
        },
        include:{
          objective:{
            select:{
              workspaceId:true
            }
          }
        }
      })

      if(!keyResult){
        throw new NotFoundException('Key result not found')
      }

      const isSameWorkspace = keyResult.objective.workspaceId === task.workspaceId
      if(!isSameWorkspace){
        throw new ForbiddenException('You cannot link task to key result in different workspaces')
      }

      return this.prisma.taskKeyResult.create({
        data:{
          taskId:task.id,
          keyResultId:keyResult.id
        }
      })
  }

  async UnLinkTaskToKeyResult(taskId: string, keyResultId: string, user: AuthUser) {
    const task = await this.prisma.task.findUnique({
        where: {
          id: taskId, deletedAt: null,
        },
      })

      if(!task){
        throw new NotFoundException('Task not found')
      }

      await this.permissionService.assertPermission(task.workspaceId, user.id, PERMISSION_KEYS.TASK_UNLINK_KEYRESULT, task.projectId ?? undefined)

      const keyResult = await this.prisma.keyResult.findUnique({
        where:{
          id: keyResultId
        },
        include:{
          objective:{
            select:{
              workspaceId:true
            }
          }
        }
      })

      if(!keyResult){
        throw new NotFoundException('Key result not found')
      }

      const isSameWorkspace = keyResult.objective.workspaceId === task.workspaceId
      if(!isSameWorkspace){
        throw new ForbiddenException('You are not a member in this workspace')
      }

    const taskKeyResult = await this.prisma.taskKeyResult.findUnique({
      where: {
        taskId_keyResultId: {taskId, keyResultId}
      }
    })

    if(!taskKeyResult){
      throw new NotFoundException('Task key result not found')
    }

    return this.prisma.taskKeyResult.delete({
      where: {
        taskId_keyResultId: {taskId, keyResultId}
      }
    })

  }
  
  /** Co quyen hanh dong tren task hay khong */
  async assertTaskPermission(taskId: string, userId: string) {
  const task = await this.prisma.taskAssignee.findUnique({
    where: {
      taskId_userId:{taskId, userId}
    },
  });

  const isSuperAdmin = await this.permissionService.isSuperAdmin(userId);


  if (!task && !isSuperAdmin) {
    throw new ForbiddenException('You do not have permission on this task');
  }

  return task;
}

  // async assertCanViewTask(task: any, userId: string) {
  //   if (await this.permissionService.isSuperAdmin(userId)) return;

  //   const createdById = task.createdById ?? task.createdBy?.id;
  //   if (createdById === userId) return;

  //   const isAssignee = task.taskAssignees?.some(
  //     (a: any) => a.userId === userId || a.user?.id === userId
  //   );
  //   if (isAssignee) return;

  //   const isProjectMember = task.project?.members?.some(
  //     (m: any) => m.userId === userId && m.deletedAt === null
  //   );
  //   if (isProjectMember) return;

  //   const projectId = task.projectId ?? task.project?.id ?? undefined;
  //   const hasAssignPerm = await this.permissionService.hasPermission(
  //     task.workspaceId,
  //     userId,
  //     PERMISSION_KEYS.TASK_ASSIGN,
  //     projectId
  //   );
  //   if (hasAssignPerm) return;

  //   throw new ForbiddenException('You do not have permission to view this task');
  // }

  //cai thien thuat toan dung nghia den
  async assertCanViewTask(task: { workspaceId: string; projectId: string | null }, userId: string) {
    const m = await this.permissionService.getMembership(userId, task.workspaceId, task.projectId);

    if (m.superAdmin) return;

    const canView = task.projectId
      ? m.projectRank > 0 || m.workspaceRank >= ROLE_RANK[ROLE_KEY_DEFAULT.WORKSPACE_MANAGER]
      : m.workspaceRank > 0;

    if (!canView){
      throw new ForbiddenException('You cannot view this task');
    } 
  }

}
