import { Test, TestingModule } from '@nestjs/testing';
import { NhapExcelController } from './nhap-excel.controller.js';
import { NhapExcelService } from './nhap-excel.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ExcelService } from '../excel/excel.service.js';
import { PermissionService } from '../permission/permission.service.js';

describe('NhapExcelController', () => {
  let controller: NhapExcelController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NhapExcelController],
      providers: [
        NhapExcelService,
        { provide: PrismaService, useValue: {} },
        { provide: ExcelService, useValue: {} },
        { provide: PermissionService, useValue: { checkAdmin: async () => true } },
      ],
    }).compile();

    controller = module.get<NhapExcelController>(NhapExcelController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

