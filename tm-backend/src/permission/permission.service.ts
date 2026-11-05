import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from "../prisma/prisma.service.js"


@Injectable()
export class PermissionService {

    constructor(private readonly prisma: PrismaService) { }

    /*Hàm dùng cho check admin thôi, trả về chu fon */
    async checkAdmin(nguoiDungId: string): Promise<boolean> {
        const dong = await this.prisma.nguoiDungVaiTro.findFirst({
            where: { nguoiDungId, vaiTro: { ma: 'ADMIN' } },
        });
        return !!dong;
    }

    async hasPermission(nguoiDungId: string, maQuyen: string, boPhanId: string ):Promise<boolean>{
        const isAdmin = await this.checkAdmin(nguoiDungId);

        if(isAdmin){
            return true;
        }

        //dòng
        const dong = await this.prisma.thanhVienBoPhan.findFirst({
            where: {
                nguoiDungId, 
                boPhanId, 
                boPhan:{
                    ngungHoatDong: false
                }
                ,
                OR: [
                    { ngayKetThuc: null },
                    { ngayKetThuc: {
                        gte: new Date() } 
                    }
                ],
                vaiTro: { 
                    quyenHan :{ 
                        some: {
                             quyenHan: { ma: maQuyen } 
                            } 
                        }
                    } 
                },
            });
        return !!dong;
    }

    async checkPermission(nguoiDungId: string, maQuyen: string, boPhanId: string){
        const hasPermission = await this.hasPermission(nguoiDungId, maQuyen, boPhanId)

        if(!hasPermission){
            throw new ForbiddenException('Bạn không có đủ thẩm quyền để thực hiện hành động này');
        }
    }

}
