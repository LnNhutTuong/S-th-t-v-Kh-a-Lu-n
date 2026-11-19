import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PermissionService } from "../permission.service.js";
import { PERMISSION_KEY } from "../decorators/permission.decoration.js";

@Injectable()
export class QuyenBoPhanGuard implements CanActivate {
    constructor(private reflector: Reflector, private permissionService: PermissionService) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        
        const maQuyen = this.reflector.getAllAndOverride<string>(PERMISSION_KEY, [context.getHandler(), context.getClass()])

        if(!maQuyen){
            return true;    
        }

        const req = context.switchToHttp().getRequest();
        
        await this.permissionService.checkPermission(req.user.id, maQuyen, req.params.boPhanId);
        return true;
    }
}