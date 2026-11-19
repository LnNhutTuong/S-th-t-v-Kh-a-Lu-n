# Phase 6 — Workflow Engine (State Machine)

> **Mục tiêu**: Thay thế `status: String` tự do bằng State Machine cấu hình được.
> Mỗi Project có thể có Workflow riêng, định nghĩa các bước và quy tắc chuyển trạng thái.
>
> **Ước lượng**: 2–3 buổi làm việc.

---

## Bối cảnh vấn đề

Hiện tại `status` trong `Task` là một chuỗi tự do:
```
status: String @default("TODO")
```

Người dùng có thể truyền bất kỳ giá trị nào: `"TODO"`, `"xyz"`, `"RANDOM"` → không kiểm soát được.

Phase 6 sẽ thêm **Workflow Engine** để:
- Định nghĩa các bước hợp lệ (WorkflowStep): `TODO`, `IN_PROGRESS`, `REVIEW`, `DONE`
- Định nghĩa các chuyển trạng thái hợp lệ (WorkflowTransition): `TODO → IN_PROGRESS`, `IN_PROGRESS → REVIEW`...
- Khi update `status` của Task, phải kiểm tra có được phép chuyển không.

---

## Giai đoạn 6.1 — Thêm 3 bảng mới vào Schema

Thêm vào `prisma/schema.prisma`:

```prisma
// Workflow gắn với 1 Project
model Workflow {
  id          String   @id @default(uuid())
  name        String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  projectId String   @unique   // Mỗi project chỉ có 1 workflow
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  steps       WorkflowStep[]
  transitions WorkflowTransition[]
}

// Mỗi bước trong workflow (ví dụ: TODO, IN_PROGRESS, DONE)
model WorkflowStep {
  id         String  @id @default(uuid())
  name       String              // Tên trạng thái: "TODO", "IN_PROGRESS"...
  label      String              // Nhãn hiển thị: "Chưa làm", "Đang làm"...
  isInitial  Boolean @default(false)  // Trạng thái ban đầu khi tạo Task
  isFinal    Boolean @default(false)  // Trạng thái kết thúc (DONE, CANCELLED...)
  color      String?             // Màu hiển thị UI: "#22c55e"
  order      Int     @default(0) // Thứ tự hiển thị

  workflowId String
  workflow   Workflow @relation(fields: [workflowId], references: [id], onDelete: Cascade)

  fromTransitions WorkflowTransition[] @relation("FromStep")
  toTransitions   WorkflowTransition[] @relation("ToStep")

  @@unique([workflowId, name]) // Trong 1 workflow, tên bước phải unique
}

// Quy tắc chuyển trạng thái: từ bước A → bước B
model WorkflowTransition {
  id    String @id @default(uuid())
  label String? // Nhãn: "Bắt đầu làm", "Gửi review"...

  workflowId String
  workflow   Workflow @relation(fields: [workflowId], references: [id], onDelete: Cascade)

  fromStepId String
  fromStep   WorkflowStep @relation("FromStep", fields: [fromStepId], references: [id], onDelete: Cascade)

  toStepId String
  toStep   WorkflowStep @relation("ToStep", fields: [toStepId], references: [id], onDelete: Cascade)

  @@unique([workflowId, fromStepId, toStepId])
}
```

> ⚠️ Cần thêm relation ngược vào `Project`:
> ```prisma
> model Project {
>   ...
>   workflow Workflow?  // ← thêm dòng này
> }
> ```

Sau khi sửa schema:
```bash
npx prisma migrate dev --name add_workflow_engine
npx prisma generate
```

---

## Giai đoạn 6.2 — WorkflowModule

### File structure

```
src/workflow/
  dto/
    create-workflow.dto.ts       ← Tạo workflow kèm steps và transitions
    update-workflow.dto.ts
  workflow.module.ts
  workflow.controller.ts
  workflow.service.ts
```

### DTOs

**`CreateWorkflowDto`**:
```typescript
projectId: string           // bắt buộc
name: string                // tên workflow: "Default", "Scrum"...
steps: CreateStepDto[]      // danh sách bước
transitions: CreateTransitionDto[]  // danh sách quy tắc chuyển
```

**`CreateStepDto`** (nested trong CreateWorkflowDto):
```typescript
name: string       // "TODO", "IN_PROGRESS"
label: string      // "Chưa làm", "Đang làm"
isInitial?: boolean
isFinal?: boolean
color?: string
order?: number
```

**`CreateTransitionDto`** (nested):
```typescript
fromStepName: string   // Dùng tên thay vì ID để tiện hơn
toStepName: string
label?: string
```

### WorkflowService — các hàm cần viết

**`create(dto, user)`**:
- Kiểm tra Project tồn tại, user là ProjectMember.
- Kiểm tra Project chưa có Workflow (mỗi project 1 workflow).
- Tạo Workflow + Steps + Transitions trong 1 transaction.
- Validate: phải có ít nhất 1 `isInitial=true` và 1 `isFinal=true`.
- Validate transitions: `fromStepName` và `toStepName` phải tồn tại trong `steps`.

**`findByProject(projectId, user)`**:
- Lấy Workflow của Project kèm Steps (order by `order`) và Transitions.

**`getValidTransitions(projectId, currentStatus)`**:
- Từ `currentStatus` (tên bước hiện tại), trả về danh sách các bước có thể chuyển đến.
- Dùng trong TaskService để validate khi update status.

**`assertValidTransition(projectId, fromStatus, toStatus)`** ← Helper quan trọng nhất:
- Kiểm tra có tồn tại Transition từ `fromStatus` đến `toStatus` không.
- Nếu không → throw `BadRequestException('Invalid status transition')`.
- Nếu Project chưa có Workflow → bỏ qua (cho phép chuyển tự do, backward compatible).

---

## Giai đoạn 6.3 — Tích hợp vào TaskService

Sửa hàm `updateTask` trong `TaskService`:

```typescript
// Trong updateTask(), trước khi gọi prisma.task.update():
if (dto.status && dto.status !== task.status) {
  await this.workflowService.assertValidTransition(
    task.projectId,
    task.status,    // trạng thái hiện tại
    dto.status      // trạng thái muốn chuyển đến
  );
}
```

> ⚠️ `WorkflowService` cần được inject vào `TaskModule`.

---

## Giai đoạn 6.4 — Seed Workflow mặc định

Cập nhật `prisma/seed.ts` để thêm Workflow mặc định cho Project đã seed:

```typescript
// Seed workflow với 4 bước và các transition hợp lệ
// TODO → IN_PROGRESS → REVIEW → DONE
// REVIEW → IN_PROGRESS (có thể trả về)
// Bất kỳ bước nào → CANCELLED
```

---

## Endpoints

```
GET    /workflows/project/:projectId    ← Xem workflow của project
POST   /workflows                       ← Tạo workflow mới cho project
PATCH  /workflows/:id                   ← Cập nhật tên/mô tả
DELETE /workflows/:id                   ← Xóa (cascade steps & transitions)

GET    /workflows/:id/transitions?from=TODO   ← Xem có thể chuyển sang đâu từ TODO
```

---

## Kiểm tra cuối Phase 6

1. `npx tsc --noEmit` → 0 errors.
2. `npx prisma migrate dev --name add_workflow_engine` thành công.
3. Test Postman:
   - `POST /workflows` → tạo workflow với steps: TODO, IN_PROGRESS, DONE.
   - `GET /workflows/project/:id` → thấy workflow kèm steps.
   - `PATCH /tasks/:id` với `status: "IN_PROGRESS"` (từ TODO) → **thành công**.
   - `PATCH /tasks/:id` với `status: "DONE"` (từ TODO, bỏ qua IN_PROGRESS) → **400 Bad Request**.
   - Test với Project chưa có Workflow → vẫn update status bình thường (backward compatible).

---

## Lưu ý kỹ thuật

1. **Backward compatible**: Nếu Project chưa có Workflow, `assertValidTransition` phải **bỏ qua** chứ không báo lỗi. Không được làm hỏng các Task đã tạo trước.

2. **Transaction**: Tạo Workflow + Steps + Transitions trong `prisma.$transaction([...])` để nếu lỗi một chỗ, rollback toàn bộ.

3. **Không hard-code status**: Sau Phase 6, các status như `TODO`, `IN_PROGRESS`, `DONE` phải lấy từ `WorkflowStep.name` trong DB, không còn viết cứng trong code nữa.

4. **`WorkflowModule` cần export `WorkflowService`** để `TaskModule` có thể import và dùng `assertValidTransition`.

---

*Last updated: 2026-10-02*
