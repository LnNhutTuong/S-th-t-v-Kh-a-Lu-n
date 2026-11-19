# Phase 5 — Dynamic Module Engine (customFields)

> **Mục tiêu**: Sử dụng field `customFields: Json?` có sẵn trong bảng `Task`
> để lưu trữ dữ liệu đặc thù theo từng loại công việc (Module 1A).
> Không hard-code cứng bất kỳ trường nào, toàn bộ cấu trúc xác định tại runtime.
>
> **Ước lượng**: 1–2 buổi làm việc.

---

## Bối cảnh vấn đề

Trong hệ thống có nhiều loại Task với đặc trưng riêng biệt:

| Loại Task | Cần lưu thêm |
|---|---|
| **Nhiệm vụ học thuật** | `standardScore` (điểm chuẩn), `difficulty` (độ khó), `expectedOutput` (sản phẩm kỳ vọng) |
| **Công việc vận hành** | `estimatedHours`, `actualHours`, `department` |
| **Task nghiên cứu** | `researchField`, `publicationTarget`, `methodology` |

Thay vì tạo 3 bảng riêng biệt cho 3 loại Task, chúng ta lưu tất cả vào **`customFields: Json?`** của bảng `Task` hiện có.

**Vấn đề cần giải quyết ở Phase 5**: Ai cũng có thể nhét bất kỳ dữ liệu gì vào `customFields`.
Phase 5 định nghĩa **schema chuẩn theo loại Task** và xác thực dữ liệu đầu vào.

---

## Schema liên quan

Không cần tạo bảng mới. Chỉ cần thêm 1 field vào DTO và xử lý logic:

```
Task {
  ...
  customFields  Json?   // ← Trường sẽ sử dụng ở Phase 5
  ...
}
```

---

## Giai đoạn 5.1 — Định nghĩa cấu trúc JSON chuẩn

### Quyết định thiết kế

`customFields` sẽ có dạng:
```json
{
  "moduleType": "ACADEMIC",
  "fields": {
    "standardScore": 8.5,
    "difficulty": "MEDIUM",
    "expectedOutput": "Báo cáo phân tích 20 trang"
  }
}
```

### Các loại `moduleType` ban đầu

| moduleType | Các fields cần validate |
|---|---|
| `ACADEMIC` | `standardScore` (number, 0–10), `difficulty` (LOW/MEDIUM/HIGH), `expectedOutput` (string?) |
| `OPERATIONAL` | `estimatedHours` (number > 0), `actualHours` (number?, >= 0), `department` (string?) |
| `GENERAL` | Không validate gì thêm (chấp nhận bất kỳ object) |

### File cần tạo

```
src/task/
  custom-fields/
    custom-fields.validator.ts      ← Class validator tùy chỉnh
    schemas/
      academic.schema.ts            ← Định nghĩa schema loại ACADEMIC
      operational.schema.ts         ← Định nghĩa schema loại OPERATIONAL
```

> ⚠️ **Quan trọng**: Không dùng `eval()`. Dùng Zod hoặc class-validator
> để xác thực an toàn các trường trong `customFields`.

---

## Giai đoạn 5.2 — Tạo Custom Validator (class-validator)

### Tạo `@IsValidCustomFields()` decorator

Viết một **custom validation decorator** dùng cho DTO:

```typescript
// Cách dùng trong CreateTaskDto / UpdateTaskDto
@IsValidCustomFields()
@IsOptional()
customFields?: Record<string, unknown>
```

**Logic bên trong validator**:
1. Nếu `customFields` là `undefined` → pass (không validate gì).
2. Lấy `moduleType` từ trong object.
3. Nếu `moduleType === 'ACADEMIC'` → validate các fields theo schema ACADEMIC.
4. Nếu `moduleType === 'OPERATIONAL'` → validate theo schema OPERATIONAL.
5. Nếu `moduleType === 'GENERAL'` hoặc không có → pass.
6. Nếu `moduleType` không hợp lệ → báo lỗi.

### Thư viện đề xuất: `zod`

Zod cho phép định nghĩa schema rõ ràng và validate an toàn:

```typescript
// Cài đặt: npm install zod
import { z } from 'zod';

export const AcademicSchema = z.object({
  moduleType: z.literal('ACADEMIC'),
  fields: z.object({
    standardScore: z.number().min(0).max(10),
    difficulty: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    expectedOutput: z.string().optional(),
  }),
});
```

---

## Giai đoạn 5.3 — Tích hợp vào TaskService

### `createTask` và `updateTask`

- Không cần sửa DB query nhiều, chỉ cần đảm bảo `customFields` được truyền đúng.
- Prisma tự lưu object JSON vào DB, không cần mapping thêm.

**Lưu ý**: Khi lưu vào Prisma, ép kiểu sang `Prisma.InputJsonValue`:
```typescript
customFields: dto.customFields as Prisma.InputJsonValue ?? Prisma.JsonNull,
```

### `findOne` và `findAll`

- Không cần thay đổi, `customFields` sẽ được trả về tự động trong response.
- Frontend đọc `moduleType` để biết cách hiển thị form tương ứng.

---

## Giai đoạn 5.4 — Thêm `moduleType` vào DTO

### Cập nhật `CreateTaskDto`

```typescript
// Thêm field này vào CreateTaskDto
@IsString()
@IsOptional()
@IsIn(['ACADEMIC', 'OPERATIONAL', 'GENERAL'])
moduleType?: string

// Field customFields đã có, thêm validator mới
@IsValidCustomFields()
@IsOptional()
customFields?: Record<string, unknown>
```

> ⚠️ **Lưu ý**: `moduleType` có thể lưu riêng hoặc lồng vào trong `customFields`.
> Đề xuất lưu lồng vào trong để giữ `Task` model không bị thêm field mới.

---

## Giai đoạn 5.5 — Unit Test cho Validator

**Đây là phần BẮT BUỘC phải làm ở Phase 5.**

Test các case:
1. `customFields = undefined` → pass
2. `moduleType = 'ACADEMIC'`, `standardScore = 8.5`, `difficulty = 'HIGH'` → pass
3. `moduleType = 'ACADEMIC'`, `standardScore = 15` (vượt quá 10) → fail
4. `moduleType = 'ACADEMIC'`, `difficulty = 'EXTREME'` (không hợp lệ) → fail
5. `moduleType = 'OPERATIONAL'`, `estimatedHours = -1` (âm) → fail
6. `moduleType = 'UNKNOWN_TYPE'` → fail
7. `moduleType = 'GENERAL'`, truyền bất kỳ object → pass

**File test**:
```
src/task/custom-fields/custom-fields.validator.spec.ts
```

---

## Endpoints sau Phase 5

Không có endpoint mới. Chỉ cập nhật behavior của các endpoint đã có:

```
POST  /tasks       ← Giờ validate customFields theo moduleType
PATCH /tasks/:id   ← Giờ validate customFields theo moduleType
```

---

## Kiểm tra cuối Phase 5

1. `npx tsc --noEmit` → 0 errors.
2. Chạy Unit Test: `npx vitest run` hoặc `npx jest`.
3. Test trên Postman:
   - `POST /tasks` với `customFields: { moduleType: 'ACADEMIC', fields: { standardScore: 8.5, difficulty: 'HIGH' } }` → 201 thành công.
   - `POST /tasks` với `customFields: { moduleType: 'ACADEMIC', fields: { standardScore: 15 } }` → 400 Bad Request.
   - `POST /tasks` không có `customFields` → vẫn 201 thành công (optional).

---

## Lưu ý kỹ thuật

1. **Không dùng `eval()`** — Nguy hiểm, dễ bị injection. Dùng Zod hoặc class-validator.

2. **`customFields` là `Json?` trong Prisma** — Khi update, nếu bạn truyền `undefined` thì Prisma sẽ bỏ qua field đó (không xóa data cũ). Nếu muốn xóa, phải truyền `Prisma.JsonNull`.

3. **Zod vs class-validator**:
   - `class-validator` đã có sẵn trong NestJS → ít dependency hơn.
   - `Zod` mạnh hơn cho nested object validation → đề xuất dùng cho `customFields`.
   - Có thể kết hợp: dùng `class-validator` ở DTO wrapper, dùng `Zod` bên trong custom validator.

4. **Mở rộng về sau**: Khi có loại Task mới, chỉ cần thêm schema mới vào `schemas/` và đăng ký trong validator. Không cần sửa DB hay migration.

---

*Last updated: 2026-10-02*
