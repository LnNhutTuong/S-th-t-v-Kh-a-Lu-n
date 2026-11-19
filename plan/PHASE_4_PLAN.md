# Phase 4 — OKR Module (Objective & Key Result)

> **Mục tiêu**: Xây dựng CRUD đầy đủ cho Objective và KeyResult,
> liên kết Task với KeyResult qua bảng trung gian `TaskKeyResult`.
>
> **Ước lượng**: 1–2 buổi làm việc.

---

## Schema liên quan (từ `prisma/schema.prisma`)

```
Objective {
  id, title, description
  startDate?, endDate?
  workspaceId  ← bắt buộc (thuộc Workspace)
  projectId?   ← tùy chọn (thu hẹp về một Project)
  keyResults: KeyResult[]
}

KeyResult {
  id, title, description
  startValue, currentValue, targetValue   ← để tính % progress
  unit?   ← ví dụ: "%", "task", "VND"
  objectiveId  ← bắt buộc (thuộc Objective)
  taskLinks: TaskKeyResult[]
}

TaskKeyResult {
  taskId       ← FK → Task
  keyResultId  ← FK → KeyResult
  @@id([taskId, keyResultId])
}
```

> **Lưu ý**: `Objective` **không có** `createdById`. Cần kiểm tra quyền
> thông qua `workspaceId` và `WorkspaceMember`. `KeyResult` kế thừa
> quyền từ Objective.

---

## Giai đoạn 4.1 — ObjectiveModule

### Tạo file structure

```
src/objective/
  dto/
    create-objective.dto.ts
    update-objective.dto.ts
    objective-query.dto.ts
  objective.module.ts
  objective.controller.ts
  objective.service.ts
```

### DTOs

**`CreateObjectiveDto`**:
```typescript
workspaceId: string       // bắt buộc
title: string             // bắt buộc
description?: string
projectId?: string        // tùy chọn — gắn với Project
startDate?: Date
endDate?: Date
```

**`UpdateObjectiveDto`**: `PartialType(CreateObjectiveDto)` (tất cả optional).

**`ObjectiveQueryDto`**:
```typescript
workspaceId?: string
projectId?: string        // lọc theo project
page?: number
limit?: number
```

### ObjectiveService — các hàm cần viết

**`findAll(userId, query)`**:
- Lọc theo `workspaceId` nếu có (kiểm tra user là `WorkspaceMember`).
- Lọc theo `projectId` nếu có.
- Include: `keyResults { id, title, currentValue, targetValue }`.
- Phân trang: `skip`, `take`.

**`findOne(id, userId)`**:
- Lấy Objective kèm `keyResults` (đầy đủ fields) và `project { id, name }`.
- Kiểm tra user là `WorkspaceMember` của `workspaceId` đó.

**`create(dto, userId)`**:
- Kiểm tra user là `WorkspaceMember` của `dto.workspaceId`.
- Nếu có `dto.projectId`: kiểm tra project tồn tại và thuộc `dto.workspaceId`.
- Tạo Objective.

**`update(id, dto, userId)`**:
- Kiểm tra Objective tồn tại.
- Kiểm tra user là `WorkspaceMember` của workspace chứa Objective đó.
- Cập nhật: `title`, `description`, `startDate`, `endDate`.
- ⚠️ Không cho thay đổi `workspaceId` sau khi tạo (bỏ khỏi UpdateDto hoặc ignore).

**`delete(id, userId)`**:
- Kiểm tra Objective tồn tại.
- Kiểm tra user là `WorkspaceMember`.
- Xóa Objective → Cascade tự xóa `KeyResult` và `TaskKeyResult`.

### Endpoints

```
GET    /objectives?workspaceId=&projectId=
POST   /objectives
GET    /objectives/:id
PATCH  /objectives/:id
DELETE /objectives/:id
```

---

## Giai đoạn 4.2 — KeyResultModule

### Tạo file structure

```
src/key-result/
  dto/
    create-key-result.dto.ts
    update-key-result.dto.ts
  key-result.module.ts
  key-result.controller.ts
  key-result.service.ts
```

### DTOs

**`CreateKeyResultDto`**:
```typescript
objectiveId: string       // bắt buộc
title: string             // bắt buộc
description?: string
startValue?: number       // default 0
targetValue: number       // bắt buộc (đích cần đạt)
unit?: string             // ví dụ: "%", "task", "VND"
```

**`UpdateKeyResultDto`**: `PartialType(CreateKeyResultDto)`, bỏ `objectiveId`.

**`UpdateKeyResultProgressDto`** (riêng biệt — dùng cho việc cập nhật tiến độ):
```typescript
currentValue: number      // bắt buộc
```

### KeyResultService — các hàm cần viết

**`findAllByObjective(objectiveId, userId)`**:
- Kiểm tra Objective tồn tại và user có quyền xem (WorkspaceMember).
- Trả về toàn bộ KeyResult của Objective đó.
- Include: `taskLinks { task { id, title, status } }`.

**`findOne(id, userId)`**:
- Lấy KeyResult kèm `objective { id, title, workspaceId }`.
- Kiểm tra user là WorkspaceMember.
- Include: `taskLinks { task { id, title, status } }`.

**`create(dto, userId)`**:
- Kiểm tra Objective tồn tại.
- Kiểm tra user là WorkspaceMember của workspace chứa Objective đó.
- Tạo KeyResult với `currentValue = dto.startValue ?? 0`.

**`update(id, dto, userId)`**:
- Kiểm tra KeyResult tồn tại.
- Kiểm tra quyền qua Objective → workspaceId → WorkspaceMember.
- Cập nhật: `title`, `description`, `targetValue`, `unit`.

**`updateProgress(id, dto, userId)`** ← hàm riêng, không merge với update thông thường:
- Nhận `currentValue` mới.
- Validate: `0 <= currentValue <= targetValue` (optional nhưng nên có).
- Tự tính `progress % = (currentValue / targetValue) * 100` ← trả về trong response, **không lưu vào DB** (tính on-the-fly).

**`delete(id, userId)`**:
- Kiểm tra quyền.
- Xóa KeyResult → Cascade tự xóa `TaskKeyResult`.

### Endpoints

```
GET    /key-results?objectiveId=
POST   /key-results
GET    /key-results/:id
PATCH  /key-results/:id
PATCH  /key-results/:id/progress    ← cập nhật currentValue
DELETE /key-results/:id
```

---

## Giai đoạn 4.3 — TaskKeyResult (liên kết Task ↔ KeyResult)

> Không cần tạo module riêng. Thêm endpoints vào `TaskController`
> hoặc `KeyResultController` đều được. **Đề xuất: thêm vào `TaskController`**.

### Endpoints cần thêm vào TaskController

```
POST   /tasks/:taskId/key-results/:keyResultId    ← link Task với KeyResult
DELETE /tasks/:taskId/key-results/:keyResultId    ← unlink
GET    /tasks/:taskId/key-results                 ← xem Task liên kết với KR nào
```

### Logic

**Link**:
- Kiểm tra Task tồn tại và user có quyền với Task.
- Kiểm tra KeyResult tồn tại và cùng workspace với Project của Task.
- Upsert `TaskKeyResult` (dùng `upsert` tránh lỗi duplicate).

**Unlink**:
- Kiểm tra `TaskKeyResult` tồn tại.
- Kiểm tra quyền.
- Xóa record.

**Lưu ý**: Không tự động cập nhật `currentValue` của KeyResult khi link/unlink.
Việc cập nhật `currentValue` là thủ công qua `PATCH /key-results/:id/progress`.

---

## Giai đoạn 4.4 — Đăng ký Module

Thêm vào `app.module.ts`:
```typescript
import { ObjectiveModule } from './objective/objective.module';
import { KeyResultModule } from './key-result/key-result.module';

@Module({
  imports: [
    // ... existing modules
    ObjectiveModule,
    KeyResultModule,
  ],
})
```

---

## Kiểm tra cuối Phase 4

Sau khi làm xong, test theo thứ tự trên Postman:

1. `npx tsc --noEmit` → 0 errors.
2. **Objective flow**:
   - `POST /objectives` với `workspaceId` hợp lệ.
   - `GET /objectives?workspaceId=xxx` → thấy danh sách.
   - `GET /objectives/:id` → thấy Objective kèm `keyResults`.
   - `PATCH /objectives/:id` → cập nhật title.
   - `DELETE /objectives/:id` → xóa (verify cascade).
3. **KeyResult flow**:
   - `POST /key-results` với `objectiveId` hợp lệ.
   - `GET /key-results?objectiveId=xxx`.
   - `PATCH /key-results/:id/progress` với `currentValue` mới → verify response có `progressPercent`.
   - `DELETE /key-results/:id`.
4. **TaskKeyResult flow**:
   - `POST /tasks/:taskId/key-results/:keyResultId` → link thành công.
   - `GET /tasks/:taskId/key-results` → thấy KeyResult đã link.
   - `DELETE /tasks/:taskId/key-results/:keyResultId` → unlink thành công.

---

## Lưu ý kỹ thuật

1. **Progress tính on-the-fly**: Không cần thêm field `progressPercent` vào DB.
   Trả về trong response: `progress: Math.round((currentValue / targetValue) * 100)`.

2. **Quyền đơn giản**: Phase 4 chỉ cần kiểm tra `WorkspaceMember`.
   Chưa cần RBAC đầy đủ.

3. **WorkspaceMember check** — Helper function tái sử dụng:
   ```typescript
   async assertWorkspaceMember(workspaceId: string, userId: string) {
     const member = await this.prisma.workspaceMember.findUnique({
       where: { workspaceId_userId: { workspaceId, userId } },
     });
     if (!member) throw new ForbiddenException('Not a workspace member');
   }
   ```
   Nên đặt trong `PrismaService` hoặc một `WorkspaceHelper` service dùng chung.

4. **Cascade**: Xóa `Objective` → tự xóa `KeyResult` → tự xóa `TaskKeyResult`.
   Xóa `KeyResult` → tự xóa `TaskKeyResult`.
   Xóa `Task` → tự xóa `TaskKeyResult` (đã có từ Phase 3).

---

*Last updated: 2026-10-01*
