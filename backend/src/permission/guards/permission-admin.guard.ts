import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PermissionService } from "../permission.service.js";

@Injectable()
export class AdminGuard implements CanActivate {
    constructor(private reflector: Reflector, private permissionService: PermissionService) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {

        const req = context.switchToHttp().getRequest();        

        const isAdmin = await this.permissionService.checkAdmin(req.user.id);
        if(!isAdmin){
            throw new ForbiddenException('Bạn không có đủ thẩm quyền để thực hiện hành động này!');
        }
        return true;
        
    }
}