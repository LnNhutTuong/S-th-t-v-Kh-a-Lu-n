# Phase 10 — RBAC Động: Kế Hoạch Chi Tiết V2

> **Cập nhật lý do**: Plan V1 thiếu hỗ trợ `RoleScope.SYSTEM` (SUPER_ADMIN), dẫn đến `PermissionService` chỉ check được quyền ở cấp **Workspace**, không xử lý được user cấp **System**. Plan V2 này bổ sung đầy đủ.

---

## 🗺️ Tổng Quan Kiến Trúc RBAC

### 2 Cấp phân quyền trong hệ thống:

```
┌─────────────────────────────────────────────────────────────────┐
│                      RoleScope.SYSTEM                           │
│                                                                 │
│   UserRole (bảng nối User ↔ Role SYSTEM)                        │
│   └── SUPER_ADMIN  →  Không cần Permission cụ thể,             │
│                        luôn pass mọi check                      │
└─────────────────────────────────────────────────────────────────┘
                           ↓ Nếu không phải SUPER_ADMIN
┌─────────────────────────────────────────────────────────────────┐
│                     RoleScope.WORKSPACE                         │
│                                                                 │
│   WorkspaceMember (bảng nối User ↔ Workspace, có roleId)       │
│   └── Role (WORKSPACE scope) → RolePermission → Permission      │
│       ├── Workspace Manager   → Tất cả quyền                   │
│       ├── Project Lead        → Quyền project/task              │
│       ├── Member              → Quyền task cơ bản              │
│       └── Viewer              → Chỉ xem                        │
└─────────────────────────────────────────────────────────────────┘
```

### Bảng schema liên quan:
```
Permission     : { id, key(unique), description }
Role           : { id, name, scope(SYSTEM|WORKSPACE), workspaceId?, isSystem }
RolePermission : { roleId, permissionId }  (N-N)
UserRole       : { userId, roleId }         ← Dùng cho SYSTEM scope
WorkspaceMember: { userId, workspaceId, roleId } ← Dùng cho WORKSPACE scope
WorkspaceRole  : { workspaceId, roleId }    ← Bật/tắt role trong workspace
```

---

## ❌ Vấn Đề Của Code Hiện Tại

### 1. `permission.service.ts` — Chỉ check WORKSPACE, bỏ qua SYSTEM

```typescript
// ❌ HIỆN TẠI: SUPER_ADMIN sẽ bị ForbiddenException vì không có WorkspaceMember
async hasPermission(userId, workspaceId, permissionKey) {
  const member = await this.prisma.workspaceMember.findUnique(...)
  if (!member) return false; // ← SUPER_ADMIN bị chặn ở đây!
  ...
}
```

### 2. `permission.guard.ts` — CRASH khi không có `workspaceId`

```typescript
// ❌ HIỆN TẠI: Những endpoint như PATCH /project/:id không gửi workspaceId lên
const workspaceId = request.params.workspaceId ?? request.body.workspaceId;
if (!workspaceId) throw new BadRequestException('workspaceId is required...');
```

### 3. `project.controller.ts` — Gắn `@RequirePermission` sai chỗ

```typescript
// ❌ HIỆN TẠI: PATCH /project/:id và DELETE /project/:id không có workspaceId
// Guard sẽ throw BadRequestException trước khi vào service!
@RequirePermission('project:update')  // ← Bị lỗi ngay ở Guard
async updateProject(@Param('id') id: string, ...) {}

@RequirePermission('project:delete')  // ← Bị lỗi ngay ở Guard
async deleteProject(@Param('id') id: string, ...) {}
```

### 4. `task.controller.ts` — `task:read` không tồn tại trong Permission seed

```typescript
@RequirePermission('task:read')  // ❌ Không có key này trong PERMISSION_KEYS seed.ts
async getAllTasks(...)
```

### 5. `workspace.service.ts` — `assertWorkspacePermission` không check SUPER_ADMIN

```typescript
// ❌ Hàm này không biết SUPER_ADMIN → Sẽ fail nếu SUPER_ADMIN gọi
async assertWorkspacePermission(workspaceId, userId, permissionKey) {
  const member = await this.assertWorkspaceMember(...) // ← SUPER_ADMIN bị chặn
  ...
}
```

---

## ✅ Giải Pháp — 5 Giai Đoạn

---

## Giai Đoạn 10.1 — Nâng Cấp `PermissionService` (Quan Trọng Nhất)

**File**: `src/permission/permission.service.ts`

Logic mới: **Check SYSTEM trước → Check WORKSPACE sau**

```typescript
@Injectable()
export class PermissionService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── SYSTEM LEVEL ───────────────────────────────────────────────────────────

  /**
   * Kiểm tra user có phải SUPER_ADMIN cấp hệ thống không.
   * SUPER_ADMIN có quyền làm MỌI THỨ, không cần check thêm.
   */
  async isSuperAdmin(userId: string): Promise<boolean> {
    const userRole = await this.prisma.userRole.findFirst({
      where: {
        userId,
        role: {
          name: 'SUPER_ADMIN',
          scope: RoleScope.SYSTEM,
        },
      },
    });
    return Boolean(userRole);
  }

  /**
   * Ném ForbiddenException nếu user KHÔNG phải SUPER_ADMIN.
   * Dùng cho các API chỉ dành riêng cho System Admin.
   */
  async assertSuperAdmin(userId: string): Promise<void> {
    const ok = await this.isSuperAdmin(userId);
    if (!ok) throw new ForbiddenException('This action requires system admin privileges');
  }

  // ─── WORKSPACE LEVEL ─────────────────────────────────────────────────────────

  /**
   * Kiểm tra quyền của user trong một workspace CỤ THỂ.
   * Ưu tiên 1: Nếu là SUPER_ADMIN → luôn TRUE (vượt qua mọi kiểm tra workspace)
   * Ưu tiên 2: Kiểm tra WorkspaceMember.role.permissions
   */
  async hasPermission(
    userId: string,
    workspaceId: string,
    permissionKey: string,
  ): Promise<boolean> {
    // Ưu tiên 1: SUPER_ADMIN pass all
    if (await this.isSuperAdmin(userId)) return true;

    // Ưu tiên 2: Kiểm tra trong workspace
    const member = await this.prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } },
      include: {
        role: {
          include: {
            permissions: { include: { permission: true } },
          },
        },
      },
    });

    if (!member) return false;
    return member.role.permissions.some(
      (rp) => rp.permission.key === permissionKey,
    );
  }

  /**
   * Ném ForbiddenException nếu user không có quyền trong workspace.
   * Dùng trong Service thay thế các hàm assertWorkspace* cũ.
   */
  async assertPermission(
    userId: string,
    workspaceId: string,
    permissionKey: string,
  ): Promise<void> {
    const ok = await this.hasPermission(userId, workspaceId, permissionKey);
    if (!ok) throw new ForbiddenException(`Missing permission: ${permissionKey}`);
  }

  /**
   * Kiểm tra user có phải thành viên của workspace không.
   * SUPER_ADMIN luôn pass (coi như là thành viên).
   */
  async assertWorkspaceMember(userId: string, workspaceId: string): Promise<void> {
    if (await this.isSuperAdmin(userId)) return;

    const member = await this.prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } },
    });
    if (!member) throw new ForbiddenException('You are not a member of this workspace');
  }
}
```

**Module export**:
```typescript
// permission.module.ts
@Module({
  imports: [PrismaModule],
  providers: [PermissionService],
  exports: [PermissionService],  // ← Đã có, cần giữ nguyên
})
export class PermissionModule {}
```

---

## Giai Đoạn 10.2 — Nâng Cấp `PermissionGuard` + Thêm `SystemGuard`

### 2A. Sửa `permission.guard.ts` — Hỗ trợ SUPER_ADMIN

```typescript
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionService: PermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permissionKey = this.reflector.get<string>(PERMISSION_KEY, context.getHandler());
    if (!permissionKey) return true; // Không gắn decorator → cho qua

    const request = context.switchToHttp().getRequest();
    const user: AuthUser = request.user;

    // SUPER_ADMIN luôn pass, không cần workspaceId
    if (await this.permissionService.isSuperAdmin(user.id)) return true;

    // Với user thường: bắt buộc phải có workspaceId
    const workspaceId = request.params.workspaceId ?? request.body.workspaceId;
    if (!workspaceId) throw new BadRequestException('workspaceId is required for permission check');

    const ok = await this.permissionService.hasPermission(user.id, workspaceId, permissionKey);
    if (!ok) throw new ForbiddenException(`Missing permission: ${permissionKey}`);

    return true;
  }
}
```

### 2B. Tạo mới `system.guard.ts` — Chỉ cho SUPER_ADMIN

```typescript
// src/permission/guards/system.guard.ts
@Injectable()
export class SystemGuard implements CanActivate {
  constructor(private permissionService: PermissionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: AuthUser = request.user;
    await this.permissionService.assertSuperAdmin(user.id);
    return true;
  }
}
```

**Khi nào dùng `SystemGuard`?**
- `GET /admin/workspaces` (xem toàn bộ workspace trong hệ thống)
- `GET /admin/users` (xem toàn bộ user trong hệ thống)
- `DELETE /admin/workspace/:id` (xóa workspace bởi admin hệ thống)

---

## Giai Đoạn 10.3 — Sửa Các Controller Đang Dùng `@RequirePermission` Sai

### Nguyên tắc áp dụng (nhắc lại):
```
CÓ workspaceId trong request → @RequirePermission ở Controller
KHÔNG CÓ workspaceId (chỉ có entity id) → assertPermission() trong Service
```

### Sửa `project.controller.ts`:

```typescript
// ✅ POST /project/create → Body có workspaceId → Dùng Guard ở Controller
@Post('create')
@RequirePermission('project:create')  // ← OK
async createProject(...)

// ❌→✅ PATCH /project/:id → Không có workspaceId → Bỏ RequirePermission ở đây
@Patch(':id')
// Xóa @RequirePermission('project:update') ← Bỏ dòng này
async updateProject(...)
// → Thay bằng assertPermission trong project.service.ts

// ❌→✅ DELETE /project/:id → Không có workspaceId → Bỏ RequirePermission ở đây
@Delete(':id')
// Xóa @RequirePermission('project:delete') ← Bỏ dòng này
async deleteProject(...)
// → Thay bằng assertPermission trong project.service.ts
```

### Sửa `task.controller.ts`:

```typescript
// ❌→✅ task:read không tồn tại trong seed → Sửa hoặc bỏ
@RequirePermission('task:view-all')  // ← Đổi thành key đúng, hoặc bỏ Guard vì
                                      //   GET /task không có workspaceId cũng được
```

---

## Giai Đoạn 10.4 — Nâng Cấp Các `assert*` Trong Services

### Mục tiêu: Thay thế logic kiểm tra cũ bằng `permissionService.assertPermission()`

### 4A. Sửa `workspace.service.ts`

```typescript
// ❌ Hiện tại: assertWorkspacePermission dùng logic riêng, không check SUPER_ADMIN qua PermissionService
// ✅ Sửa thành: delegate hoàn toàn về PermissionService

async assertWorkspaceMember(workspaceId: string, userId: string) {
  await this.permissionService.assertWorkspaceMember(userId, workspaceId);
  // (Không cần viết lại logic, dùng PermissionService)
}

async assertWorkspaceAdmin(workspaceId: string, userId: string) {
  await this.permissionService.assertPermission(userId, workspaceId, 'workspace:update');
}

async assertWorkspacePermission(workspaceId: string, userId: string, permissionKey: string) {
  await this.permissionService.assertPermission(userId, workspaceId, permissionKey);
}
```

### 4B. Sửa `project.service.ts`

```typescript
// updateProject: Lấy project → lấy workspaceId → assertPermission
async updateProject(id: string, dto, user: AuthUser) {
  const project = await this.prisma.project.findUnique({ where: { id } });
  if (!project) throw new NotFoundException('Project not found');
  
  await this.permissionService.assertPermission(user.id, project.workspaceId, 'project:update');
  ...
}

// deleteProject: Tương tự
async deleteProject(id: string, user: AuthUser) {
  const project = await this.prisma.project.findUnique({ where: { id } });
  if (!project) throw new NotFoundException('Project not found');
  
  await this.permissionService.assertPermission(user.id, project.workspaceId, 'project:delete');
  ...
}
```

### 4C. Sửa `metric.service.ts`

```typescript
// ❌ Hiện tại: assertWorkspaceAdmin (chỉ check member, không check permission)
// ✅ Sửa: dùng assertPermission với key cụ thể

// Trong createMetric:
await this.permissionService.assertPermission(user.id, dto.workspaceId, 'metric:create');

// Trong updateMetric:
await this.permissionService.assertPermission(user.id, metric.workspaceId, 'metric:update');

// Trong deleteMetric:
await this.permissionService.assertPermission(user.id, metric.workspaceId, 'metric:delete');
```

### 4D. Sửa `formula.service.ts`

```typescript
// ❌ Hiện tại: assertWorkspaceMember (chỉ check membership)
// ✅ Sửa: dùng assertPermission với key cụ thể

// Trong createFormula:
await this.permissionService.assertPermission(user.id, dto.workspaceId, 'formula:create');

// Trong updateFormula:
await this.permissionService.assertPermission(user.id, formula.workspaceId, 'formula:update');

// Trong deleteFormula:
await this.permissionService.assertPermission(user.id, formula.workspaceId, 'formula:delete');
```

### 4E. Sửa `objective.service.ts`, `key-result.service.ts`

```typescript
// Tương tự: Thay assertWorkspaceMember → assertPermission với key phù hợp
// objective: 'project:create' (tạo objective trong workspace)
// key-result: Kiểm tra workspace member là đủ → dùng assertWorkspaceMember từ PermissionService
```

---

## Giai Đoạn 10.5 — Inject `PermissionService` Vào Các Module

Cần thêm `PermissionModule` vào imports của các module sau:

| Module | Cần Sửa? | Lý Do |
|--------|----------|-------|
| `WorkspaceModule` | ✅ Đã có | Đã import PermissionModule |
| `ProjectModule` | ✅ Đã có | Đã import PermissionModule |
| `TaskModule` | ✅ Đã có | Đã import PermissionModule |
| `MetricModule` | ❓ Chưa có | Cần thêm để dùng PermissionService |
| `FormulaModule` | ❓ Chưa có | Cần thêm để dùng PermissionService |
| `ObjectiveModule` | ❓ Chưa có | Cần thêm nếu dùng PermissionService trực tiếp |
| `KeyResultModule` | ❓ Chưa có | Cần thêm nếu dùng PermissionService trực tiếp |

---

## 📋 Thứ Tự Thực Hiện

```
Bước 1: Nâng cấp permission.service.ts  ← Quan trọng nhất
         └── Thêm isSuperAdmin(), assertSuperAdmin(), assertWorkspaceMember()
         └── Sửa hasPermission() để check SYSTEM trước WORKSPACE

Bước 2: Nâng cấp permission.guard.ts   ← Fix bug SUPER_ADMIN bị chặn
         └── Thêm check isSuperAdmin() trước khi check workspaceId
         └── Tạo system.guard.ts nếu cần Admin-only routes

Bước 3: Sửa workspace.service.ts        ← Delegate về PermissionService
         └── Bỏ logic tự check, gọi this.permissionService.assertPermission()

Bước 4: Sửa project.controller.ts       ← Bỏ @RequirePermission sai chỗ
         └── Chỉ giữ @RequirePermission('project:create')
         └── Bỏ @RequirePermission ở PATCH/:id và DELETE/:id

Bước 5: Sửa project.service.ts          ← Thêm assertPermission cho update/delete
         └── updateProject: assertPermission('project:update')
         └── deleteProject: assertPermission('project:delete')

Bước 6: Sửa task.controller.ts          ← Đổi/bỏ 'task:read' không tồn tại

Bước 7: Sửa metric.service.ts           ← Thay assertWorkspaceAdmin → assertPermission
Bước 8: Sửa formula.service.ts          ← Thay assertWorkspaceMember → assertPermission
Bước 9: Thêm PermissionModule vào metric.module.ts, formula.module.ts
Bước 10: npx tsc --noEmit để verify 0 lỗi
```

---

## 🧪 Test Cases Cần Kiểm Tra Sau Khi Xong

| Scenario | Expected |
|----------|----------|
| SUPER_ADMIN gọi `POST /project/create` (có workspaceId) | ✅ 201 Created |
| SUPER_ADMIN gọi `DELETE /project/:id` (không workspaceId) | ✅ 200 Deleted |
| SUPER_ADMIN gọi `DELETE /workspace/:id` (không là member) | ✅ 200 Deleted |
| Member (không có project:delete) gọi `DELETE /project/:id` | ✅ 403 Forbidden |
| Member gọi `POST /project/create` (có workspaceId mà thuộc workspace) | ✅ 403 Forbidden (Member không có project:create) |
| Project Lead gọi `POST /project/create` | ❌ 403 Forbidden (Project Lead chỉ có project:update) |
| Workspace Manager gọi `DELETE /workspace/:id` | ✅ 200 Deleted |
| User không thuộc workspace gọi bất kỳ API nào | ✅ 403 Forbidden |
