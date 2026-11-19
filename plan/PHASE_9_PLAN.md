# Phase 9 — Formula Engine & KPI Calculation

> **Mục tiêu**: Xây dựng engine parse và tính toán công thức KPI động dựa trên `Metric.key`
> và giá trị thực tế từ `TaskMetricValue`. Kết quả được lưu vào `KPISnapshot`.
>
> **Ước lượng**: 2–3 buổi làm việc.

---

## Bối cảnh

Sau Phase 8, hệ thống đã có:
- `Metric`: Các chỉ số đo lường (`key: "so_commit"`, `key: "so_bai_bao"`)
- `TaskMetricValue`: Giá trị thực tế (`taskId=X, metricId=Y, value=5`)
- `Formula.expression`: Chuỗi công thức (`"so_commit * 0.4 + so_bai_bao * 0.6"`)

Phase 9 sẽ:
1. **Parse** chuỗi `expression` để tìm các biến (`so_commit`, `so_bai_bao`).
2. **Resolve** biến → lấy `value` từ `TaskMetricValue` tương ứng.
3. **Evaluate** kết quả tính toán.
4. **Lưu** vào `KPISnapshot`.

---

## Schema hiện tại (Đã có sẵn)

```prisma
model Formula {
  id          String  @id @default(uuid())
  name        String
  expression  String  // "so_commit * 0.4 + so_bai_bao * 0.6"
  description String?
  version     Int     @default(1)
  workspaceId String
  workspace   Workspace @relation(...)
  tasks       Task[]    // Task nào dùng Formula này
}

model KPISnapshot {
  id     String @id @default(uuid())
  taskId String @unique
  task   Task   @relation(...)
  score  Float
  // ... các trường chi tiết
}
```

---

## Giai đoạn 9.1 — FormulaModule (CRUD)

### Cấu trúc thư mục
```
src/formula/
  dto/
    create-formula.dto.ts
    update-formula.dto.ts
  formula.controller.ts
  formula.service.ts
  formula.module.ts
```

### DTOs

**`CreateFormulaDto`**:
```typescript
workspaceId: string;
name: string;         // "Công thức KPI nghiên cứu"
expression: string;   // "so_bai_bao * 0.6 + so_commit * 0.4"
description?: string;
```

**`UpdateFormulaDto`**:
```typescript
name?: string;
expression?: string;
description?: string;
```

### Business Logic (`FormulaService`)
1. **`create(dto, user)`**:
   - Kiểm tra user là WorkspaceMember.
   - Validate expression: Parse thử, nếu có biến nào không tồn tại trong Workspace → báo lỗi.
   - Lưu Formula + tăng `version` nếu update.

2. **`findByWorkspace(workspaceId, user)`**

3. **`update(id, dto, user)`**:
   - Nếu sửa `expression` → re-validate biến.
   - Tăng `version`.

4. **`delete(id, user)`**:
   - Chặn xóa nếu có Task nào đang dùng Formula này.

5. **`assignToTask(formulaId, taskId, user)`** ← Gán Formula cho Task:
   - Task chỉ có 1 Formula tại 1 thời điểm.
   - Formula và Task phải cùng Workspace.

---

## Giai đoạn 9.2 — FormulaEngine (Service độc lập)

> ⚠️ **KHÔNG dùng `eval()`** — rất nguy hiểm về bảo mật.
> Dùng thư viện `mathjs` hoặc tự viết parser đơn giản.

### Cài đặt thư viện
```bash
npm install mathjs
```

### Cấu trúc
```
src/formula-engine/
  formula-engine.service.ts
  formula-engine.module.ts
```

### Core logic

```typescript
import { evaluate, parse } from 'mathjs';

@Injectable()
export class FormulaEngineService {

  // Trích xuất tên biến từ expression
  extractVariables(expression: string): string[] {
    const node = parse(expression);
    const variables: string[] = [];
    node.traverse((node) => {
      if (node.type === 'SymbolNode') {
        variables.push(node.name);
      }
    });
    return [...new Set(variables)];
  }

  // Tính toán kết quả với scope là map {key: value}
  evaluate(expression: string, scope: Record<string, number>): number {
    try {
      const result = evaluate(expression, scope);
      if (typeof result !== 'number' || !isFinite(result)) {
        throw new BadRequestException('Formula produced an invalid result');
      }
      return result;
    } catch (e) {
      throw new BadRequestException(`Formula evaluation error: ${e.message}`);
    }
  }
}
```

---

## Giai đoạn 9.3 — KpiService (Tính điểm và lưu Snapshot)

### Cấu trúc
```
src/kpi/
  kpi.service.ts
  kpi.controller.ts
  kpi.module.ts
```

### Hàm quan trọng nhất: `calculate(taskId, user)`

```typescript
async calculate(taskId: string, user: AuthUser) {
  // 1. Lấy Task kèm Formula và TaskMetricValues
  const task = await this.prisma.task.findUnique({
    where: { id: taskId },
    include: {
      formula: true,
      taskMetricValues: {
        include: { metric: true }
      }
    }
  });

  if (!task.formula) {
    throw new BadRequestException('This task has no formula assigned');
  }

  // 2. Tạo scope: { so_commit: 5, so_bai_bao: 3 }
  const scope: Record<string, number> = {};
  for (const tmv of task.taskMetricValues) {
    scope[tmv.metric.key] = tmv.value;
  }

  // 3. Kiểm tra đủ biến chưa
  const requiredVars = this.formulaEngine.extractVariables(task.formula.expression);
  const missingVars = requiredVars.filter(v => !(v in scope));
  if (missingVars.length > 0) {
    throw new BadRequestException(`Missing metric values: ${missingVars.join(', ')}`);
  }

  // 4. Tính điểm
  const score = this.formulaEngine.evaluate(task.formula.expression, scope);

  // 5. Lưu vào KPISnapshot (upsert)
  return this.prisma.kPISnapshot.upsert({
    where: { taskId },
    create: { taskId, score },
    update: { score },
  });
}
```

---

## Endpoints đề xuất

### Formula:
- `POST   /formulas`                        ← Tạo Formula
- `GET    /formulas/workspace/:workspaceId` ← Danh sách Formula
- `PATCH  /formulas/:id`                    ← Cập nhật Formula
- `DELETE /formulas/:id`                    ← Xóa Formula
- `POST   /formulas/:id/assign-task`        ← Gán Formula cho Task

### KPI:
- `POST   /kpi/calculate/:taskId`          ← Kích hoạt tính điểm cho Task
- `GET    /kpi/task/:taskId`               ← Xem điểm KPI hiện tại của Task

---

## Thứ tự Phase tiếp theo (cập nhật theo yêu cầu)

```
Phase 9  → Formula Engine & KPI           ← Đang làm
Phase 10 → RBAC động (Role & Permission)  ← Bạn muốn làm trước AI
Phase 11 → Frontend (Next.js)
Phase 12 → Evaluation & Classification (Module 1D)
Phase 16 → AI Smart Features
```

---

## Checklist nghiệm thu Phase 9

1. [ ] `npm install mathjs` thành công.
2. [ ] `FormulaEngineService.evaluate()` trả về đúng kết quả số.
3. [ ] Gán Formula cho Task thành công.
4. [ ] `POST /kpi/calculate/:taskId` tính được điểm khi đủ metric values.
5. [ ] Báo lỗi khi thiếu metric value (missing variable).
6. [ ] Báo lỗi khi chia cho 0 hoặc công thức không hợp lệ.
7. [ ] `npx tsc --noEmit` → 0 errors.

---

*Last updated: 2026-10-05*
