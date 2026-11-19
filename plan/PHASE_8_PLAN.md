# Phase 8 — KPI & Metrics Module

> **Mục tiêu**: Xây dựng hệ thống nhập chỉ số đo lường (Metric) theo từng Task, phục vụ cho việc tính toán KPI ở Phase 9.
> Đây là module "nguồn dữ liệu" — lưu các giá trị thực tế để Formula Engine (Phase 9) tính điểm.
>
> **Ước lượng**: 1–2 buổi làm việc.

---

## Bối cảnh & Nghiệp vụ

Hiện tại task chỉ có `customFields` dạng JSON tự do. Phase 8 sẽ chuẩn hóa thành:
- **Metric**: Chỉ số đo lường được định nghĩa tại Workspace (ví dụ: `số_bài_báo`, `điểm_thi`, `số_commit`).
- **TaskMetricValue**: Giá trị thực tế của Metric đó trong từng Task (ví dụ: Task "Nghiên cứu" có `số_bài_báo = 3`).

```
Metric (Workspace)
    └── TaskMetricValue (Task)
           ├── metricId
           ├── taskId
           └── value (Float)
```

---

## Schema hiện tại (Đã có sẵn trong `prisma/schema.prisma`)

```prisma
model Metric {
  id          String  @id @default(uuid())
  key         String   // Mã định danh ngắn: "so_bai_bao", "diem_thi"
  name        String   // Tên hiển thị: "Số bài báo"
  description String?
  unit        String?  // Đơn vị: "bài", "điểm", "commit"

  workspaceId String
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  taskMetricValues TaskMetricValue[]

  createdAt DateTime @default(now())
}

model TaskMetricValue {
  id      String @id @default(uuid())
  value   Float
  
  taskId   String
  task     Task   @relation(fields: [taskId], references: [id], onDelete: Cascade)

  metricId String
  metric   Metric @relation(fields: [metricId], references: [id], onDelete: Cascade)

  @@unique([taskId, metricId])  // Mỗi task chỉ có 1 giá trị cho mỗi metric
}
```

> ⚠️ Cần kiểm tra lại schema thực tế, bổ sung nếu thiếu trường.

---

## Giai đoạn 8.1 — MetricModule

### Cấu trúc thư mục
```
src/metric/
  dto/
    create-metric.dto.ts
    update-metric.dto.ts
  metric.controller.ts
  metric.service.ts
  metric.module.ts
```

### DTOs

**`CreateMetricDto`**:
```typescript
workspaceId: string;
key: string;         // Mã ngắn, unique trong workspace: "so_commit"
name: string;        // Tên hiển thị: "Số commit"
description?: string;
unit?: string;       // "commit", "bài", "điểm"
```

**`UpdateMetricDto`**:
```typescript
name?: string;
description?: string;
unit?: string;
// key và workspaceId KHÔNG cho phép sửa
```

### Business Logic (`MetricService`)

1. **`create(dto, user)`**:
   - Kiểm tra Workspace tồn tại và user là WorkspaceMember.
   - Kiểm tra `key` unique trong Workspace đó.
   - Tạo Metric.

2. **`findByWorkspace(workspaceId, user)`**:
   - Lấy danh sách Metric của Workspace.
   - Kiểm tra user là WorkspaceMember.

3. **`update(id, dto, user)`**:
   - Chỉ Workspace Admin (Member có quyền) mới được sửa.
   - Không cho phép thay đổi `key` (đây là khóa định danh cho Formula).

4. **`delete(id, user)`**:
   - Chặn xóa nếu Metric đang được dùng trong `TaskMetricValue` (có dữ liệu liên quan).
   - Hoặc đang được tham chiếu trong `Formula.expression`.

---

## Giai đoạn 8.2 — TaskMetricValueModule

### Cấu trúc thư mục
```
src/task-metric-value/
  dto/
    upsert-metric-value.dto.ts
  task-metric-value.controller.ts
  task-metric-value.service.ts
  task-metric-value.module.ts
```

### DTO

**`UpsertMetricValueDto`**:
```typescript
taskId: string;
metricId: string;
value: number;
```
> Dùng `upsert` thay vì `create` + `update` riêng, vì mỗi task chỉ có 1 giá trị cho mỗi metric (`@@unique([taskId, metricId])`).

### Business Logic (`TaskMetricValueService`)

1. **`upsert(dto, user)`** ← Hàm quan trọng nhất:
   - Kiểm tra Task tồn tại, user có quyền trên Task.
   - Kiểm tra Metric tồn tại và thuộc cùng Workspace với Project của Task.
   - `prisma.taskMetricValue.upsert({ where: { taskId_metricId }, create: {...}, update: {...} })`.

2. **`findByTask(taskId, user)`**:
   - Lấy toàn bộ metric values của một Task kèm thông tin Metric (name, key, unit).
   - Đây là dữ liệu đầu vào cho Formula Engine ở Phase 9.

3. **`delete(taskId, metricId, user)`**:
   - Xóa giá trị của một metric cụ thể trong task.

---

## Endpoints đề xuất

### Metric:
- `POST   /metrics`                        ← Tạo Metric mới trong Workspace
- `GET    /metrics/workspace/:workspaceId` ← Danh sách Metric của Workspace
- `PATCH  /metrics/:id`                    ← Cập nhật Metric
- `DELETE /metrics/:id`                    ← Xóa Metric (nếu không có dữ liệu)

### TaskMetricValue:
- `POST   /task-metric-values`             ← Nhập / Cập nhật giá trị Metric cho Task (upsert)
- `GET    /task-metric-values/task/:taskId`← Xem toàn bộ giá trị Metric của 1 Task
- `DELETE /task-metric-values/:taskId/:metricId` ← Xóa giá trị 1 Metric của Task

---

## Checklist nghiệm thu Phase 8

1. [ ] Tạo `MetricModule` và `TaskMetricValueModule`, đăng ký vào `AppModule`.
2. [ ] Tạo Metric mới trong Workspace thành công.
3. [ ] Không cho phép trùng `key` trong cùng Workspace.
4. [ ] Nhập giá trị Metric cho Task thành công (`upsert` hoạt động đúng).
5. [ ] Chặn nhập giá trị Metric không thuộc Workspace của Project đó.
6. [ ] `GET /task-metric-values/task/:taskId` trả về đúng danh sách metric và giá trị.
7. [ ] `npx tsc --noEmit` → 0 errors.

---

*Last updated: 2026-10-03*
