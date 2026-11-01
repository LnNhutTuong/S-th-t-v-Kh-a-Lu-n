// import { ForbiddenException, Injectable } from '@nestjs/common';
// import { PrismaService } from "../prisma/prisma.service.js"
// import { RoleScope } from '../generated/prisma/enums.js';
// import { ROLE_NAME_DEFAULT, RANK_SUPER_ADMIN, ROLE_RANK } from './constants/quyen-han.constants.js';

// @Injectable()
// export class PermissionService {

//     constructor(private readonly prisma: PrismaService) { }

//     // ─── SYSTEM LEVEL ───────────────────────────────────────────────────────────
//     async isSuperAdmin(userId: string): Promise<boolean>{
//         const userRole = await this.prisma.userRole.findFirst({
//             where:{
//                 userId,
//                 role:{
//                     scope: RoleScope.SYSTEM,
//                     OR: [
//                         { name: 'SUPER_ADMIN' },
//                         { name: ROLE_NAME_DEFAULT.SUPER_ADMIN },
//                         { key: 'SUPER_ADMIN' },
//                     ]
//                 }
//             }
//         })

//         return Boolean(userRole)
//     }

//     async assertSuperAdmin(userId: string): Promise<void> {
//         const ok = await this.isSuperAdmin( userId);
//         if (!ok) {
//         throw new ForbiddenException(`You are not Super Admin`);
//         }
//     }


//     // ───  WORKSPACE & PROJECT LEVEL ───────────────────────────────────────────────────────────
//     /** Trả về boolean, không ném lỗi. Không phải member thì cũng là false */
//     async hasPermission(workspaceId: string, userId: string, permissionKey: string, projectId?: string | null) {

//       if (await this.isSuperAdmin(userId)) return true;

//       const permFilter = { where: { permission: { key: permissionKey } }, select: { permissionId: true }, take: 1 };

//       const member = await this.prisma.workspaceMember.findFirst({
//         where: { userId, workspaceId, deletedAt: null, user: { deletedAt: null }, workspace: { deletedAt: null } },
//         select: { role: { select: { permissions: permFilter } } },
//       });

//       if (!member) return false;

//       if (member.role.permissions.length > 0) return true;

//       if (!projectId) return false;

//       const pm = await this.prisma.projectMember.findFirst({
//         where: { userId, projectId, deletedAt: null, project: { workspaceId, deletedAt: null } },
//         select: { role: { select: { permissions: permFilter } } },
//       });

//       return (pm?.role.permissions.length ?? 0) > 0;
//     }
    
//     /** Ném lỗi nếu không có quyền */
//     async assertPermission(workspaceId: string, userId: string, permissionKey: string, projectId?: string): Promise<void> {
//         const ok = await this.hasPermission(workspaceId, userId, permissionKey, projectId);
//         if (!ok) {
//           throw new ForbiddenException(`You do not have permission`);
//         }
//     }

//     /** Ném lỗi nếu không có ít nhất 1 trong các quyền đó */
//     async assertSomePermission(workspaceId: string, userId: string, permissionKeys: string[], projectId?: string): Promise<void> {
//       const ok  = await Promise.all(permissionKeys.map(key => this.hasPermission(workspaceId, userId, key, projectId)));
//       if (!ok.some(Boolean)) {
//         throw new ForbiddenException('You do not have permission');
//       }
//     }

//     /**Laays rank user**/ 
//     async getRanks(userIds: string[], workspaceId: string, projectId?: string | null) {
//       const wms = await this.prisma.workspaceMember.findMany({
//         where: { workspaceId, userId: { in: userIds }, deletedAt: null },
//         select: { userId: true, role: { select: { key: true } } },
//       });
//       const pms = projectId
//         ? await this.prisma.projectMember.findMany({
//             where: { projectId, userId: { in: userIds }, deletedAt: null },
//             select: { userId: true, role: { select: { key: true } } },
//           })
//         : [];
//       const map = new Map<string, { workspaceRank: number; projectRank: number; rank: number }>();
//       for (const id of userIds) {
//         const wr = ROLE_RANK[wms.find((m) => m.userId === id)?.role.key ?? ''] ?? 0;
//         const pr = ROLE_RANK[pms.find((m) => m.userId === id)?.role.key ?? ''] ?? 0;
//         map.set(id, { workspaceRank: wr, projectRank: pr, rank: Math.max(wr, pr) });
//       }
//       return map;
//     }

//     /**Check member ship**/ 
//     async getMembership(userId: string, workspaceId: string, projectId?: string | null) {
//       if (await this.isSuperAdmin(userId)) {
//         return { superAdmin: true, workspaceRank: RANK_SUPER_ADMIN, projectRank: RANK_SUPER_ADMIN, rank: RANK_SUPER_ADMIN };
//       }
//       // TODO (sau khi có parentId): nếu là Owner/Manager của workspace cha -> rank 5
//       return { superAdmin: false, ...(await this.getRanks([userId], workspaceId, projectId)).get(userId)! };
//     }
// }
