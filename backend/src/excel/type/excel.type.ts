export interface CotExcel { 
    tieuDe: string; 
    khoa: string; 
    doRong?: number, 
    ghiChu?: string, 
    danhSach?: string[], 
    viDu?: unknown 
};

export interface DongExcel { 
    dong: number; 
    giaTri: Record<string, unknown>
};

export interface SheetExcel { 
    ten: string; 
    cot: CotExcel[]; 
    dong: Record<string, unknown>[];
}