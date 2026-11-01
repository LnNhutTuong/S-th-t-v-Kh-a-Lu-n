import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { PhamViVaiTro } from '../src/generated/prisma/enums.js';
import {
  DINH_NGHIA_QUYEN,
  LOAI_VAN_BAN_BAN_DAU,
  MA_VAI_TRO_ADMIN,
  QUYEN_THEO_CAP_BAC,
  VAI_TRO_BO_PHAN,
  VAI_TRO_DE_TAI,
} from '../src/permission/constants/quyen-han.constants.js';

// ==============================================================================
// SEED TaskMenT (theo TaskMenT-DacTa.md v1.0, mục 3.2)
// Chỉ tạo: ADMIN, quyền hạn, vai trò (ADMIN, vai trò theo loại bộ phận, vai trò đề tài),
// loại văn bản. KHÔNG tạo bộ phận và người dùng khác: ADMIN nhập qua giao diện hoặc Excel.
//
// An toàn khi chạy lại (idempotent):
// - Quyền hạn và loại văn bản: tạo nếu chưa có; quyền thì cập nhật mô tả.
// - Vai trò: cập nhật tên, phạm vi, loại bộ phận, cấp bậc; KHÔNG ghi đè soLuongToiDa
//   (ADMIN có thể đã chỉnh, ví dụ nâng số Phó Hiệu trưởng).
// - Gán quyền cho vai trò: chỉ THÊM quyền còn thiếu, không bao giờ gỡ quyền ADMIN đã chỉnh.
// ==============================================================================

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('Cần DATABASE_URL để chạy seed');

// Ở production bắt buộc đặt ADMIN_EMAIL, không dùng email mặc định để thử nghiệm.
const emailMacDinhDeThu = 'lnnhuttuong@gmail.com';
if (process.env.NODE_ENV === 'production' && !process.env.ADMIN_EMAIL) {
  throw new Error('Ở production phải đặt biến môi trường ADMIN_EMAIL');
}
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? emailMacDinhDeThu).trim().toLowerCase();
const ADMIN_TEN = process.env.ADMIN_TEN ?? 'Quản trị viên';

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function seedQuyenHan(): Promise<Map<string, string>> {
  const idTheoMa = new Map<string, string>();
  for (const { ma, moTa } of Object.values(DINH_NGHIA_QUYEN)) {
    const q = await prisma.quyenHan.upsert({
      where: { ma },
      update: { moTa },
      create: { ma, moTa },
    });
    idTheoMa.set(ma, q.id);
  }
  return idTheoMa;
}

async function themQuyenChoVaiTro(vaiTroId: string, maQuyen: string[], idQuyen: Map<string, string>) {
  const data = maQuyen.map((ma) => {
    const quyenHanId = idQuyen.get(ma);
    if (!quyenHanId) throw new Error(`Quyền ${ma} chưa có trong danh mục quyền`);
    return { vaiTroId, quyenHanId };
  });
  // skipDuplicates: chỉ thêm phần còn thiếu, không đụng tới quyền đã có.
  await prisma.vaiTroQuyenHan.createMany({ data, skipDuplicates: true });
}

async function seedVaiTro(idQuyen: Map<string, string>) {
  // ADMIN: phạm vi hệ thống, có toàn bộ quyền (guard vẫn có thể cho ADMIN vượt quyền).
  const admin = await prisma.vaiTro.upsert({
    where: { ma: MA_VAI_TRO_ADMIN },
    update: { ten: 'Quản trị viên', phamVi: PhamViVaiTro.HE_THONG },
    create: { ma: MA_VAI_TRO_ADMIN, ten: 'Quản trị viên', phamVi: PhamViVaiTro.HE_THONG },
  });
  await themQuyenChoVaiTro(admin.id, [...idQuyen.keys()], idQuyen);

  // Vai trò theo từng loại bộ phận (không dùng chung giữa các loại).
  for (const vt of VAI_TRO_BO_PHAN) {
    const role = await prisma.vaiTro.upsert({
      where: { ma: vt.ma },
      update: {
        ten: vt.ten,
        phamVi: PhamViVaiTro.BO_PHAN,
        loaiBoPhan: vt.loaiBoPhan,
        capBac: vt.capBac,
      },
      create: {
        ma: vt.ma,
        ten: vt.ten,
        phamVi: PhamViVaiTro.BO_PHAN,
        loaiBoPhan: vt.loaiBoPhan,
        capBac: vt.capBac,
        soLuongToiDa: vt.soLuongToiDa,
      },
    });
    await themQuyenChoVaiTro(role.id, QUYEN_THEO_CAP_BAC[vt.capBac], idQuyen);
  }

  // Vai trò trong phạm vi đề tài/đề án.
  for (const vt of VAI_TRO_DE_TAI) {
    const role = await prisma.vaiTro.upsert({
      where: { ma: vt.ma },
      update: { ten: vt.ten, phamVi: PhamViVaiTro.DE_TAI },
      create: { ma: vt.ma, ten: vt.ten, phamVi: PhamViVaiTro.DE_TAI },
    });
    await themQuyenChoVaiTro(role.id, vt.quyen, idQuyen);
  }

  return admin.id;
}

async function seedLoaiVanBan() {
  for (const [i, l] of LOAI_VAN_BAN_BAN_DAU.entries()) {
    await prisma.loaiVanBan.upsert({
      where: { ma: l.ma },
      update: {}, // không ghi đè chỉnh sửa của người có thẩm quyền
      create: { ma: l.ma, ten: l.ten, thuTu: i + 1 },
    });
  }
}

async function seedAdmin(adminVaiTroId: string) {
  const nguoiDung = await prisma.nguoiDung.upsert({
    where: { email: ADMIN_EMAIL },
    update: { deletedAt: null },
    create: { email: ADMIN_EMAIL, ten: ADMIN_TEN },
  });
  await prisma.nguoiDungVaiTro.createMany({
    data: [{ nguoiDungId: nguoiDung.id, vaiTroId: adminVaiTroId }],
    skipDuplicates: true,
  });
  return nguoiDung;
}

async function main() {
  const idQuyen = await seedQuyenHan();
  const adminVaiTroId = await seedVaiTro(idQuyen);
  await seedLoaiVanBan();
  const admin = await seedAdmin(adminVaiTroId);

  const [soQuyen, soVaiTro, soLoaiVanBan] = await Promise.all([
    prisma.quyenHan.count(),
    prisma.vaiTro.count(),
    prisma.loaiVanBan.count(),
  ]);
  console.log('Seed xong:');
  console.log(`- Quyền hạn: ${soQuyen}, vai trò: ${soVaiTro}, loại văn bản: ${soLoaiVanBan}`);
  console.log(`- ADMIN: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });