# Phase 10 — RBAC Động (Role-Based Access Control)

> **Mục tiêu**: Thay thế toàn bộ các `assert*` hardcode bằng hệ thống phân quyền động dựa trên `Permission.key`. Sau phase này, việc cấp/thu quyền chỉ cần thao tác trên database, KHÔNG cần sửa code.
>
> **Ước lượng**: 3–4 buổi làm việc.

---

## Bối cảnh — Cấu trúc RBAC đã có trong schema

```
Permission        Role               WorkspaceMember
id                id                 userId (PK)
key (unique)      name               workspaceId (PK)
description       scope              roleId  <── Mỗi member có 1 Role
                  (SYSTEM|WORKSPACE)
                  workspaceId?
                  isSystem

RolePermission (Bảng nối N-N: Role <-> Permission)
```

### Các điểm thiết kế cốt lõi:
- **`Permission`**: Định nghĩa một lần ở cấp hệ thống, dùng chuỗi `key` ngắn (ví dụ: `task:create`, `formula:delete`).
- **`Role`**: Tập hợp các `Permission`. Scope `WORKSPACE` dùng cho thành viên Workspace.
- **`WorkspaceMember.roleId`**: Mỗi thành viên mang đúng 1 Role trong Workspace.

---

## Giai đoạn 10.1 — Seed dữ liệu khởi tạo (prisma/seed.ts)

### Danh sách Permission cần seed:

```
workspace:update    workspace:delete    workspace:invite    workspace:remove-member
project:create      project:update      project:delete      project:manage-members
task:create         task:update         task:delete         task:assign         task:view-all
output:create       output:update       output:delete
evidence:submit     evidence:review
metric:create       metric:update       metric:delete
formula:create      formula:update      formula:delete      formula:assign-task
kpi:calculate       kpi:view
```

### Các Role Workspace mặc định:

| Role Name | Permissions tiêu biểu |
|---|---|
| `Workspace Manager` | Tất cả quyền |
| `Project Lead` | project:update, task:create/update/assign, evidence:review, kpi:view |
| `Member` | task:update, evidence:submit, kpi:view |
| `Viewer` | Chỉ xem (kpi:view, task:view-all) |

---

## Giai đoạn 10.2 — PermissionService

```
src/permission/
  permission.service.ts
  permission.module.ts
```

### Hàm cốt lõi:

```typescript
async hasPermission(userId: string, workspaceId: string, permissionKey: string): Promise<boolean> {
  const member = await this.prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
    include: {
      role: {
        include: {
          permissions: {
            include: { permission: true }
          }
        }
      }
    }
  });

  if (!member) return false;
  return member.role.permissions.some(rp => rp.permission.key === permissionKey);
}

async assertPermission(userId: string, workspaceId: string, permissionKey: string): Promise<void> {
  const ok = await this.hasPermission(userId, workspaceId, permissionKey);
  if (!ok) throw new ForbiddenException(`Missing permission: ${permissionKey}`);
}
```

---

## Giai đoạn 10.3 — Guard + Decorator

### Decorator `@RequirePermission(key)`:

```typescript
// src/permission/permission.decorator.ts
export const PERMISSION_KEY = 'required_permission';
export const RequirePermission = (key: string) => SetMetadata(PERMISSION_KEY, key);
```

### `PermissionGuard`:

```typescript
// src/permission/permission.guard.ts
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionService: PermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permissionKey = this.reflector.get<string>(PERMISSION_KEY, context.getHandler());
    if (!permissionKey) return true;

    const request = context.switchToHttp().getRequest();
    const user: AuthUser = request.user;
    const workspaceId = request.params.workspaceId ?? request.body.workspaceId;
    
    if (!workspaceId) throw new BadRequestException('workspaceId is required for permission check');

    const ok = await this.permissionService.hasPermission(user.id, workspaceId, permissionKey);
    if (!ok) throw new ForbiddenException(`Missing permission: ${permissionKey}`);
    return true;
  }
}
```

### Cách dùng trên Controller (sau khi xong):

```typescript
@Post()
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequirePermission('task:create')
create(@Body() dto: CreateTaskDto, @CurrentUser() user: AuthUser) { ... }
```

---

## Giai đoạn 10.4 — RoleModule (Admin API)

```
src/role/
  dto/
    create-role.dto.ts     // name, workspaceId, permissionIds: string[]
    assign-role.dto.ts     // userId, workspaceId, roleId
  role.service.ts
  role.controller.ts
  role.module.ts
```

### Business Logic (`RoleService`):

1. **`create(dto, user)`**: Tạo Role + gán Permission. Chỉ người có quyền `workspace:manage-roles`.
2. **`assignRole(dto, user)`**: Gán Role cho thành viên (cập nhật `WorkspaceMember.roleId`).
3. **`findByWorkspace(workspaceId, user)`**: Danh sách Role của Workspace kèm permissions.
4. **`addPermission(roleId, permissionId, user)`**: Thêm Permission vào Role.
5. **`removePermission(roleId, permissionId, user)`**: Thu hồi Permission khỏi Role.

---

## Giai đoạn 10.5 — Thay thế `assert*` hardcode dần dần

Sau khi có Guard và seed xong:

| Hardcode cũ | RBAC mới |
|---|---|
| `assertWorkspaceMember(wId, uId)` | `assertPermission(uId, wId, 'workspace:view')` |
| `assertProjectMember(pId, uId)` | `assertPermission(uId, wId, 'project:view')` |
| `assertTaskPermission(tId, uId)` | `assertPermission(uId, wId, 'task:update')` |
| `createdById === user.id` check để xóa | `assertPermission(uId, wId, 'task:delete')` |

> Không nên thay hết một lúc. Làm từng module, test sau mỗi module.

---

## Endpoints đề xuất

```
GET    /permissions                        <- Danh sách toàn bộ Permission (SUPER_ADMIN)
POST   /roles                              <- Tạo Role mới trong Workspace
GET    /roles/workspace/:workspaceId       <- Danh sách Role của Workspace (kèm permissions)
POST   /roles/:id/permissions              <- Thêm Permission vào Role
DELETE /roles/:id/permissions/:permId     <- Xóa Permission khỏi Role
POST   /roles/assign                       <- Gán Role cho WorkspaceMember
```

---

## Thứ tự thực hiện

```
[10.1] seed.ts: Seed Permission + 4 Role mặc định -> chạy db:seed
[10.2] PermissionService: hasPermission + assertPermission
[10.3] PermissionGuard + @RequirePermission decorator
[10.4] RoleModule: CRUD Role + assign role cho member
[10.5] Gắn Guard vào 3 endpoint quan trọng nhất trước: task:create, formula:delete, kpi:calculate
[10.6] Dần thay thế các assert* còn lại theo module
```

---

## Checklist nghiệm thu Phase 10

1. [ ] Seed thành công: 20+ Permissions, 4 Roles mặc định, gán đúng Permission cho từng Role.
2. [ ] `PermissionGuard`: User thiếu quyền → 403 Forbidden.
3. [ ] User đủ quyền → thao tác thành công.
4. [ ] `POST /roles/assign` gán đúng Role cho thành viên.
5. [ ] Thêm / xóa Permission khỏi Role → ảnh hưởng ngay lập tức, không cần sửa code.
6. [ ] `npx tsc --noEmit` → 0 errors.

---

*Last updated: 2026-10-06*
