# Phase 7 — Task Output & Evidence (Module 1B)

> **Mục tiêu**: Xây dựng hệ thống quản lý **Sản phẩm đầu ra (TaskOutput)** và **Nộp & Phê duyệt minh chứng (Evidence)** gắn với từng Task.
> Đây là module cốt lõi để chuẩn bị dữ liệu cho việc tính toán KPI & Đánh giá (Module 1A, 1C, 1D ở các phase sau).
>
> **Ước lượng**: 2 buổi làm việc.

---

## Bối cảnh & Nghiệp vụ

1. **TaskOutput (Sản phẩm đầu ra kỳ vọng)**:
   - Mỗi Task có thể có 0, 1 hoặc nhiều đầu ra cần nộp (ví dụ: "Báo cáo tiến độ", "Link GitHub PR", "Biên bản nghiệm thu").
   - Định dạng kỳ vọng (`expectedType`): `DOCUMENT`, `LINK`, `OTHER`.

2. **Evidence (Minh chứng nộp cho TaskOutput)**:
   - Thành viên được giao task (Assignee) hoặc thành viên trong project nộp minh chứng (link file, URL tài liệu...).
   - Khi nộp, trạng thái mặc định là: `status: PENDING`.
   - **Reviewer** (Project Manager / Creator / Leader) sẽ duyệt (`ACCEPTED`) hoặc từ chối (`REJECTED`) kèm ghi chú (`reviewNote`).
   - Tự động ghi nhận: `uploadedById`, `uploadedAt`, `reviewedById`, `reviewedAt`.

---

## Schema hiện tại (Đã có sẵn trong `prisma/schema.prisma`)

```prisma
model TaskOutput {
  id           String     @id @default(uuid())
  title        String
  description  String?
  expectedType OutputType @default(DOCUMENT) // DOCUMENT | LINK | OTHER
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  taskId String
  task   Task   @relation(fields: [taskId], references: [id], onDelete: Cascade)

  evidences Evidence[]
}

model Evidence {
  id         String         @id @default(uuid())
  fileUrl    String
  fileName   String?
  mimeType   String?
  status     EvidenceStatus @default(PENDING) // PENDING | ACCEPTED | REJECTED
  reviewNote String?
  createdAt  DateTime       @default(now())
  updatedAt  DateTime       @updatedAt

  taskOutputId String
  taskOutput   TaskOutput @relation(fields: [taskOutputId], references: [id], onDelete: Cascade)

  uploadedById String
  uploadedBy   User     @relation("EvidenceSubmitter", fields: [uploadedById], references: [id], onDelete: Cascade)
  uploadedAt   DateTime @default(now())

  reviewedById String?
  reviewedBy   User?    @relation("EvidenceReviewer", fields: [reviewedById], references: [id], onDelete: SetNull)
  reviewedAt   DateTime?
}
```

---

## Giai đoạn 7.1 — TaskOutputModule

### Cấu trúc thư mục
```
src/task-output/
  dto/
    create-task-output.dto.ts
    update-task-output.dto.ts
  task-output.controller.ts
  task-output.service.ts
  task-output.module.ts
```

### DTOs
**`CreateTaskOutputDto`**:
```typescript
taskId: string;
title: string;
description?: string;
expectedType?: OutputType; // enum: DOCUMENT, LINK, OTHER (mặc định DOCUMENT)
```

**`UpdateTaskOutputDto`**:
```typescript
title?: string;
description?: string;
expectedType?: OutputType;
```

### Business Logic (`TaskOutputService`)
1. **`create(dto, user)`**:
   - Kiểm tra Task tồn tại.
   - Kiểm tra User là thành viên của Project chứa Task.
   - Tạo TaskOutput.
2. **`findByTaskId(taskId, user)`**:
   - Lấy danh sách TaskOutput của Task kèm các `evidences` (kèm thông tin người nộp, người duyệt).
3. **`update(id, dto, user)`**:
   - Kiểm tra quyền (Leader/Creator hoặc Assignee của Task).
   - Cập nhật thông tin.
4. **`delete(id, user)`**:
   - Xóa TaskOutput (Cascade xóa các evidences liên quan).

---

## Giai đoạn 7.2 — EvidenceModule

### Cấu trúc thư mục
```
src/evidence/
  dto/
    submit-evidence.dto.ts
    review-evidence.dto.ts
  evidence.controller.ts
  evidence.service.ts
  evidence.module.ts
```

### DTOs
**`SubmitEvidenceDto`**:
```typescript
taskOutputId: string;
fileUrl: string;       // URL file hoặc link tài liệu
fileName?: string;     // Tên file gốc (ví dụ: "bao-cao-q3.pdf")
mimeType?: string;     // Kiểu mime (ví dụ: "application/pdf")
```

**`ReviewEvidenceDto`**:
```typescript
status: EvidenceStatus; // ACCEPTED hoặc REJECTED (không cho phép set lại PENDING)
reviewNote?: string;    // Lý do duyệt hoặc lý do từ chối
```

### Business Logic (`EvidenceService`)
1. **`submit(dto, user)`**:
   - Kiểm tra `taskOutputId` tồn tại.
   - Kiểm tra `user` thuộc Project chứa Task.
   - Tạo Evidence với `status = PENDING`, `uploadedById = user.id`, `uploadedAt = now()`.
2. **`review(id, dto, user)`**:
   - Kiểm tra Evidence tồn tại.
   - Kiểm tra quyền duyệt: Chỉ Project Creator, Manager, hoặc người có quyền quản trị trong Project mới được duyệt (không cho tự nộp rồi tự duyệt).
   - Cập nhật `status`, `reviewNote`, `reviewedById = user.id`, `reviewedAt = now()`.
3. **`findByTaskOutput(taskOutputId, user)`**:
   - Lấy toàn bộ lịch sử minh chứng đã nộp cho Output này.
4. **`delete(id, user)`**:
   - Chỉ người nộp (khi đang ở `PENDING`) hoặc Quản trị viên mới được xóa.

---

## Giai đoạn 7.3 — Danh sách Endpoints đề xuất

### Task Output:
- `POST   /task-outputs`               ← Tạo yêu cầu đầu ra cho Task
- `GET    /task-outputs/task/:taskId`  ← Lấy danh sách đầu ra của 1 Task kèm Evidence
- `PATCH  /task-outputs/:id`           ← Cập nhật thông tin đầu ra
- `DELETE /task-outputs/:id`           ← Xóa đầu ra

### Evidence:
- `POST   /evidences`                  ← Nộp minh chứng mới cho 1 TaskOutput
- `PATCH  /evidences/:id/review`       ← Duyệt / Từ chối minh chứng (ACCEPTED / REJECTED)
- `GET    /evidences/output/:outputId` ← Xem danh sách minh chứng của 1 TaskOutput
- `DELETE /evidences/:id`              ← Xóa / Hủy minh chứng (nếu chưa duyệt)

---

## Checklist nghiệm thu Phase 7

1. [ ] Tạo `TaskOutputModule` và `EvidenceModule`, đăng ký vào `AppModule`.
2. [ ] Nộp minh chứng thành công với `status = PENDING`.
3. [ ] Duyệt minh chứng thành công (`ACCEPTED` / `REJECTED`), lưu đúng `reviewedById` và `reviewedAt`.
4. [ ] Chặn thành viên không thuộc project nộp hoặc xem minh chứng.
5. [ ] Chặn người không có thẩm quyền tự duyệt minh chứng.
6. [ ] Chạy `npx tsc --noEmit` không có bất kỳ lỗi nào.
