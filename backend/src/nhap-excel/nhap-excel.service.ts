import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ExcelService } from '../excel/excel.service.js';
import { LoaiNhapExcel } from '../generated/prisma/enums.js';
import { ImporterExcel, LoiExcel } from './type/nhap-excel.type.js';
import { DongExcel } from '../excel/type/excel.type.js';

@Injectable()
export class NhapExcelService {
  constructor(
    private prisma: PrismaService,
    private excel: ExcelService,
  ) {}

  private importers = new Map<LoaiNhapExcel, ImporterExcel>();

  DangKy(importer: ImporterExcel) {
    this.importers.set(importer.loai, importer);
  }

  private layImporter(loai: LoaiNhapExcel): ImporterExcel {
    const importer = this.importers.get(loai);
    if (!importer){
      throw new BadRequestException('Chưa hỗ trợ nhập loại này');
    }
    return importer;
  }

  async XemTruoc(loai: LoaiNhapExcel, nguoiTaoId: string, tenFile: string, buffer: Buffer) {
    const importer = this.layImporter(loai);
    const cacDong = await this.excel.ReadFile(buffer);

    if (cacDong.length === 0) {
      throw new BadRequestException('File không có dữ liệu');
    }

    const loi: LoiExcel[] = [];
    const cotCoTrongFile = Object.keys(cacDong[0].giaTri);

    for (const c of importer.cot) {
      if (!cotCoTrongFile.includes(c.tieuDe)) {
        loi.push({ dong: 1, cot: c.tieuDe, thongBao: 'Thiếu cột này trong file' });
      }
    }

    // lỗi từng dòng
    if (loi.length === 0) {
      for (const d of cacDong) loi.push(...importer.kiemTra(d));
    }

    // trùng khóa trong file, đếm tạo mới / cập nhật
    let soTaoMoi = cacDong.length;
    let soCapNhat = 0;

    if (loi.length === 0 && importer.cotKhoa) {
      const cotKhoa = importer.cotKhoa;
      const daThay = new Map<string, number>(); // khóa -> dòng xuất hiện đầu tiên

      for (const d of cacDong) {
        const giaTri = importer.layKhoa ? importer.layKhoa(d) : d.giaTri[cotKhoa];
        if (giaTri === null || giaTri === undefined) continue;

        const khoa = String(giaTri).toLowerCase();
        const dongDau = daThay.get(khoa);

        if (dongDau !== undefined) {
          loi.push({ dong: d.dong, cot: cotKhoa, thongBao: `Trùng với dòng ${dongDau}` });
        } else {
          daThay.set(khoa, d.dong);
        }
      }

      if (loi.length === 0 && importer.timKhoaDaCo) {
        const daCo = await importer.timKhoaDaCo([...daThay.keys()]);
        soCapNhat = [...daThay.keys()].filter((k) => daCo.has(k)).length;
        soTaoMoi = cacDong.length - soCapNhat;
      }
    }

    if (loi.length === 0 && importer.kiemTraCaFile) {
      loi.push(...(await importer.kiemTraCaFile(cacDong)));
    }

    const tomTat = { tongDong: cacDong.length, soLoi: loi.length, soTaoMoi, soCapNhat };

    return this.prisma.phienNhapExcel.create({
      data: {
        loai,
        nguoiTaoId,
        tenFile,
        trangThai: loi.length > 0 ? 'LOI' : 'XEM_TRUOC',
        duLieuXemTruoc: cacDong as any,
        loi: loi as any,
        tomTat,
        hetHanLuc: new Date(Date.now() + 30 * 60 * 1000),
      },
    });
  }

  async Duyet(phienId: string, nguoiId: string){
    const phien = await this.prisma.phienNhapExcel.findUnique({
      where:{
        id: phienId
      }
    })

    if(!phien){
      throw new NotFoundException("Không tìm thấy phiên nhập");
    }

    if(phien.nguoiTaoId !== nguoiId){
      throw new BadRequestException("Không phải phiên nhập của bạn");
    }

    if(phien.trangThai === 'LOI'){
      throw new BadRequestException("File còn lỗi, hãy sửa và tải lên lại");
    }

    if(phien.trangThai !== 'XEM_TRUOC'){
      throw new BadRequestException("Phiên đã được xử lý");
    }

    if(phien.hetHanLuc < new Date()){
      throw new BadRequestException("Phiên đã hết hạn, hãy tải lên lại");
    }

    const importer = this.layImporter(phien.loai);
    const cacDong = phien.duLieuXemTruoc as unknown as DongExcel[];

    await this.prisma.$transaction(async (tx) => {
      const r = await tx.phienNhapExcel.updateMany({
        where: {
           id: phienId, 
           trangThai: 'XEM_TRUOC' 
          },

        data: {
           trangThai: 'DA_DUYET', 
           duyetLuc: new Date() 
          },
      });

      if (r.count === 0){
        throw new BadRequestException('Phiên này đã được xử lý');
      }

      await importer.ghi(cacDong, tx);

    });

    return {thanhCong: true};
  }

  async Huy(phienId: string, nguoiId: string){
    const phien = await this.prisma.phienNhapExcel.findUnique({
      where:{
        id: phienId
      }
    })

    if(!phien){
      throw new NotFoundException("Không tìm thấy phiên");
    }

    if(phien.nguoiTaoId !== nguoiId){
      throw new ForbiddenException("Không phải phiên của bạn");
    }

    if (phien.trangThai === 'DA_DUYET'){
      throw new BadRequestException('Phiên đã duyệt, không hủy được');
    }

    await this.prisma.phienNhapExcel.update({ where: { id: phienId }, data: { trangThai: 'DA_HUY' } })

    return {thanhCong: true};

  }

  async DonPhienHetHan(){
    return this.prisma.phienNhapExcel.deleteMany({
      where:{
        hetHanLuc:{
          lt: new Date()
        },
        trangThai:{
          in:['XEM_TRUOC', 'LOI', 'DA_HUY']
        }
      }
    })
  }

  

}

