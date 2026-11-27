"use client";

import { boPhanTreeType, boPhanType, CHA_HOP_LE, LoaiBoPhan, LoaiBpCanChonNhom, NhomDonVi, suaBoPhanBody, taoBoPhanBody, TEN_LOAI_BO_PHAN, TEN_NHOM_BO_PHAN } from "@/features/bo-phan/type/boPhan.type";
import { boPhanForm, boPhanSchema } from "@/features/bo-phan/schema/bo-phan.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useMemo, useRef } from "react";
import { useCayBoPhan, useSuaBoPhan, useTaoBoPhan } from "@/hooks/use-bo-phan";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { goiYMaBoPhan } from "@/utils/bo-phan/goi-y-ma-bo-phan";
import { ChuanHoaTenBp } from "@/utils/bo-phan/chuan-hoa-ten-bp";
import { toast } from "sonner";
type Props = { open: boolean, onOpenChange: (open: boolean) => void, boPhan: boPhanType | null, boPhanChaMacDinh?: string }

// tra ve cai mang cha` ba' nen viet func bien thanh mang
const lamPhang = (cay: boPhanTreeType[]): boPhanTreeType[] => {
    return cay.flatMap((nut) => [nut, ...lamPhang(nut.con ?? [])]);
}

export default function DialogBoPhan({ open, onOpenChange, boPhan, boPhanChaMacDinh }: Props){

    const isEdit = !!boPhan; //check bo phan: neu co thi true

    const form = useForm<boPhanForm>({
        resolver: zodResolver(boPhanSchema),
        defaultValues: isEdit ?
        {
            ma: boPhan?.ma,
            ten: boPhan?.ten,
            loai: boPhan?.loai,
            boPhanChaId: boPhan?.boPhanChaId ?? "",
            nhom: boPhan?.nhom ?? ""
        } : {
            ma: "",
            ten: "",
            loai: "",
            boPhanChaId: boPhanChaMacDinh ?? "",
            nhom: ""
        }
    })

    const { reset } = form;

    const tao = useTaoBoPhan();
    const sua = useSuaBoPhan(boPhan?.id ?? "");
    const dangGui = isEdit ? sua.isPending : tao.isPending;

    const handleChangeLoai = (loaiMoi: LoaiBoPhan) => {
        
        if(!loaiMoi) return;

        //can phai co nhom
        const canNhom = LoaiBpCanChonNhom.includes(loaiMoi)
        if(!canNhom){ //thuoc loai can nhom thi cho no chon
            form.setValue("nhom", "");
        }else if(!form.getValues("nhom")){ //neu ma no gui di voi nhom rong thi cho vo su nghiep
            form.setValue("nhom", NhomDonVi.SU_NGHIEP);
        }

        //check cha
        const chaHienTai = listBoPhan.find((b) => b.id === form.getValues("boPhanChaId"));
        if (chaHienTai && !CHA_HOP_LE[loaiMoi].includes(chaHienTai.loai)){
            form.setValue("boPhanChaId", "");
        } 

        capNhatMaGoiY(form.getValues("ten"), loaiMoi)
    }

    const {data: cayBoPhan, isLoading: dangTaiCay} = useCayBoPhan(false);

    const listBoPhan = useMemo(()=> lamPhang(cayBoPhan ?? []), [cayBoPhan]);

    // eslint-disable-next-line react-hooks/incompatible-library
    const loai = form.watch("loai"); //lay cai loai ra o cac input co key la loai

    const danhSachCha = useMemo(() => {
        if(!loai){
            return [];
        }

        // lay cai mang cha hop le o cai key cua loai
        const chaHopLe = CHA_HOP_LE[loai as LoaiBoPhan] ?? [];  

        //1. filter de lay danh sach cha theo tung loai
        //2. khong the tu lay ban than minh lam cha
        return listBoPhan.filter((bp) => chaHopLe.includes(bp.loai as LoaiBoPhan) && bp.id !== boPhan?.id);

    }, [loai, listBoPhan, boPhan?.id])

    //Kiem tra list bo phan hien tai xem co ban giam hieu chua
    //Rat quan trong (call back an toan)
    const daCoBanGiamHieu = useMemo(() => {
        return listBoPhan.some((bp) => { return bp.loai === LoaiBoPhan.BAN_GIAM_HIEU})
    }, [listBoPhan])

    const danhSachLoai = useMemo(()=> {
        if(!daCoBanGiamHieu){
            return [LoaiBoPhan.BAN_GIAM_HIEU];
        }

        return Object.values(LoaiBoPhan).filter((l) => l !== LoaiBoPhan.BAN_GIAM_HIEU)

    }, [daCoBanGiamHieu])

    //Lay ca nhung thang da bi ngung hoat dong thi moi check all ma duoc
    const {data: cayBoPhanTatCa} = useCayBoPhan(true);

    //Loai tru cai ma dang xai ra nua~~~~
    const cacMaBoPhanKhac = useMemo(() => {
        return new Set(
            lamPhang(cayBoPhanTatCa ?? [])
            .filter((b) => b.id !== boPhan?.id) // loai tru bo phan hien tai
            .map((b) => b.ma.toUpperCase())
        );
    }, [cayBoPhanTatCa, boPhan?.id]);


    const daSuaMaTay = useRef(false);

    const capNhatMaGoiY = (ten: string, loaiHienTai: LoaiBoPhan) => {
        if(isEdit || daSuaMaTay.current) return;

        form.setValue("ma", goiYMaBoPhan(ten, loaiHienTai || "", cacMaBoPhanKhac))
    }

    const tenDangGo = form.watch("ten").trim();
    const tenXemTruoc = ChuanHoaTenBp(tenDangGo, loai);

    const onSubmit = (giaTri: boPhanForm) => {

        if(!isEdit){
            const body: taoBoPhanBody = {
                ma: giaTri.ma,
                ten: ChuanHoaTenBp(giaTri.ten, giaTri.loai),
                loai: giaTri.loai as LoaiBoPhan,
                boPhanChaId: giaTri.boPhanChaId || undefined,
                nhom: LoaiBpCanChonNhom.includes(giaTri.loai as LoaiBoPhan) ? giaTri.nhom as NhomDonVi : undefined,
            }

            tao.mutate(body,{onSuccess: () => onOpenChange(false)})
        }else{
            if(!boPhan) return;

            const body: suaBoPhanBody = {};
            if (giaTri.ten.trim() !== boPhan.ten) { 
                const tenMoi = ChuanHoaTenBp(giaTri.ten, boPhan.loai); 
                if (tenMoi !== boPhan.ten) body.ten = tenMoi; 
            }
            
            if(giaTri.boPhanChaId !== (boPhan.boPhanChaId ?? "")){
                body.boPhanChaId = giaTri.boPhanChaId;
            } 

            if(LoaiBpCanChonNhom.includes(boPhan.loai) && giaTri.nhom !== (boPhan.nhom ?? "") ){
                body.nhom = giaTri.nhom as NhomDonVi;
            }

            if(Object.keys(body).length === 0){
                form.reset();
                onOpenChange(false)
                toast.message('Không có gì thay đổi', {
                    description: new Date().toLocaleString(),
                })
                return;
            }

            sua.mutate(body, { onSuccess: () => onOpenChange(false) });
        }
    }

    const dong = () => onOpenChange(false);
    
    useEffect(() => {
        if (!open) return;

        daSuaMaTay.current = false;
        reset(boPhan ? {
            ma: boPhan.ma,
            ten: boPhan.ten,
            loai: boPhan.loai,
            boPhanChaId: boPhan.boPhanChaId ?? "",
            nhom: boPhan.nhom ?? ""
        } : {
            ma: "",
            ten: "",
            loai: "",
            boPhanChaId: boPhanChaMacDinh ?? "",
            nhom: ""
        });
    }, [open, boPhan, boPhanChaMacDinh, reset]);


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Sửa bộ phận" : "Thêm bộ phận"}</DialogTitle>
                    <DialogDescription>Nhập thông tin để {isEdit ? "cập nhật" : "tạo"} bộ phận.</DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="ma">Mã: <span className="text-xs text-muted-foreground">Được gợi ý từ tên, bạn có thể chỉnh sửa.</span></FieldLabel>
                            <Input id="ma" className="border-input bg-background text-foreground" {...form.register("ma", { onChange: (e) => { daSuaMaTay.current = e.target.value !== ""; } })} readOnly={isEdit} />
                            <FieldError errors={[form.formState.errors.ma]} />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="ten">Tên</FieldLabel>
                            <Input id="ten" className="border-input bg-background text-foreground" {...form.register("ten", { onChange: (e) => capNhatMaGoiY(e.target.value, form.getValues("loai") as LoaiBoPhan) })} />
                            {tenDangGo && tenXemTruoc !== tenDangGo && (!isEdit || tenDangGo !== boPhan?.ten) && <p className="text-xs text-muted-foreground">Tên sẽ được lưu: <strong>{tenXemTruoc}</strong></p>}
                            <FieldError errors={[form.formState.errors.ten]} />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="loai">Loại</FieldLabel>
                            {boPhan ? (
                                <Input id="loai" className="border-input bg-background text-foreground" value={TEN_LOAI_BO_PHAN[boPhan.loai]} readOnly />
                            ) : !dangTaiCay ? (
                                <Select id="loai" className="w-full border-input bg-background text-foreground" {...form.register("loai", { onChange: (e) => handleChangeLoai(e.target.value as LoaiBoPhan) })}>
                                    <option value="">Chọn loại</option>
                                    {danhSachLoai.map((loaiBoPhan) => (
                                        <option key={loaiBoPhan} value={loaiBoPhan}>{TEN_LOAI_BO_PHAN[loaiBoPhan]}</option>
                                    ))}
                                </Select>
                            ) : null}
                            <FieldError errors={[form.formState.errors.loai]} />
                        </Field>

                        {loai && loai !== LoaiBoPhan.BAN_GIAM_HIEU && (
                            <Field>
                                <FieldLabel htmlFor="boPhanChaId">Bộ phận cha</FieldLabel>
                                <Select key={loai} id="boPhanChaId" className="w-full border-input bg-background text-foreground" {...form.register("boPhanChaId")}>
                                    <option value="">Chọn bộ phận cha</option>
                                    {danhSachCha.map((b) => (
                                        <option key={b.id} value={b.id}>{b.ten} ({TEN_LOAI_BO_PHAN[b.loai]})</option>
                                    ))}
                                </Select>
                                <FieldError errors={[form.formState.errors.boPhanChaId]} />
                            </Field>
                        )}

                        {LoaiBpCanChonNhom.includes(loai as LoaiBoPhan) && (
                            <Field>
                                <FieldLabel htmlFor="nhom">Nhóm</FieldLabel>
                                <Select id="nhom" className="w-full border-input bg-background text-foreground" {...form.register("nhom")}>
                                    <option value="">Chọn nhóm</option>
                                    {Object.values(NhomDonVi).map((nhom) => (
                                        <option key={nhom} value={nhom}>{TEN_NHOM_BO_PHAN[nhom]}</option>
                                    ))}
                                </Select>
                                <FieldError errors={[form.formState.errors.nhom]} />
                            </Field>
                        )}
                    </FieldGroup>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={dong}>Hủy</Button>
                        <Button type="submit" disabled={dangGui || dangTaiCay}>{dangGui ? "Đang lưu..." : "Lưu"}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
