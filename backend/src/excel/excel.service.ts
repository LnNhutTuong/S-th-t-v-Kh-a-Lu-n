import { BadRequestException, Injectable } from '@nestjs/common';
import ExcelJS from "exceljs";
import { SheetExcel, DongExcel, CotExcel } from './type/excel.type.js';

@Injectable()
export class ExcelService {
  async CreateFile(listSheets: SheetExcel[]): Promise<Buffer> {
    const wb = new ExcelJS.Workbook(); //tao danh sach Workbook
    
    for (const sheet of listSheets) { //chay danh sach sheet
      const ws = wb.addWorksheet(sheet.ten); //tao sheet, roi add vao wb 

      ws.columns = sheet.cot.map((c) => ({
        header: c.tieuDe,
        key: c.khoa,
        width: c.doRong ?? 20,
      }));

      ws.addRows(sheet.dong);

      ws.getRow(1).font = { bold: true };
    }
    
    return Buffer.from(await wb.xlsx.writeBuffer());
  }

  //xu ly gia tri khi duoc import tu excel
  // "A " = A
  private ChuanHoaGiaTri(v: ExcelJS.CellValue): unknown {
    if (v === null || v === undefined) {
      return null;
    }

    if (typeof v === 'string') {
      const vTrim = v.trim();

      return vTrim !== "" ? vTrim : null;
    }

    if (v instanceof Date) {
      return v;
    }

    if (typeof v === "object") {
      if ('result' in v) {
        return this.ChuanHoaGiaTri(v.result as ExcelJS.CellValue);
      }

      if ('richText' in v) {
        const vRich = v.richText.map((t) => t.text).join('').trim();
        return vRich !== "" ? vRich : null;
      }

      if ('hyperlink' in v) {
        return v.text;
      }

      return null;
    }

    return v;
  }

  async ReadFile(buffer: Buffer, tenSheet?: string): Promise<DongExcel[]> {
    const wb = new ExcelJS.Workbook();
    try{
      await wb.xlsx.load(buffer as any);
    }catch(e){
      throw new BadRequestException('Không đọc được file, hãy dùng file .xlsx tải từ hệ thống');
    }
    

    const ws = tenSheet ? wb.getWorksheet(tenSheet) : wb.worksheets[0];
    if (!ws) {
      throw new BadRequestException('Không tìm thấy sheet');
    }

    // dòng 1: lưu tên cột với vị trí của số cột
    const tieuDe: Record<number, string> = {};
    ws.getRow(1).eachCell((cell, soCot) => {
      const ten = String(this.ChuanHoaGiaTri(cell.value) ?? '');
      if (ten !== '') tieuDe[soCot] = ten;
    });

    const ketQua: DongExcel[] = [];
    ws.eachRow((row, soDong) => {
      if (soDong === 1) return;

      const giaTri: Record<string, unknown> = {};
      for (const [soCot, ten] of Object.entries(tieuDe)) {
        giaTri[ten] = this.ChuanHoaGiaTri(row.getCell(Number(soCot)).value);
      }

      // bỏ dòng trống hoàn toàn
      if (Object.values(giaTri).every((v) => v === null)) return;

      ketQua.push({ dong: soDong, giaTri });
    });

    return ketQua;
  }

  async CreateTemplate(cot: CotExcel[]): Promise<Buffer> {
    const wb = new ExcelJS.Workbook();

    const taoCot = () =>
      cot.map((c) => ({
        header: c.tieuDe,
        key: c.khoa,
        width: c.doRong ?? 20,
      }));

    // Sheet 1: để người dùng điền, có ghi chú và dropdown
    const ws = wb.addWorksheet('DuLieu');
    ws.columns = taoCot();
    ws.getRow(1).font = { bold: true };

    cot.forEach((c, i) => {
      if (c.ghiChu) {
        ws.getCell(1, i + 1).note = c.ghiChu;
      }

      if (c.danhSach && c.danhSach.length > 0) {
        for (let r = 2; r <= 1000; r++) {
          ws.getCell(r, i + 1).dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: ['"' + c.danhSach.join(',') + '"'],
          };
        }
      }
    });

    // Sheet 2: một dòng ví dụ, không bị ReadFile đọc nhầm
    const wsViDu = wb.addWorksheet('ViDu');
    wsViDu.columns = taoCot();
    wsViDu.getRow(1).font = { bold: true };
    wsViDu.addRow(Object.fromEntries(cot.map((c) => [c.khoa, c.viDu ?? null])));

    return Buffer.from(await wb.xlsx.writeBuffer());
  }
}
