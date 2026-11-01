
import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { timingSafeEqual } from 'crypto';

//tìm càng nhiều cách check càng tốt
//vì làm passwordless thì phải chịu thôi chú em

@Injectable()
export class InternalKeyGuard {
  
  canActivate(context: ExecutionContext) {
    const sent = context.switchToHttp().getRequest().headers['x-internal-key'];
    const key = process.env.INTERNAL_API_KEY;

    //check lan 1
    if(!key || typeof key !== 'string'){
      throw new UnauthorizedException('Lỗi đăng nhập')
    }

    //check lan 2
    const bufSent = Buffer.from(sent);
    const bufKey = Buffer.from(key)

    if(bufSent.length != bufKey.length){
        throw new UnauthorizedException('Lỗi đăng nhập')
    }

    //check lan 3
    const timingSafe = timingSafeEqual(bufSent, bufKey);
    if(!timingSafe){
        throw new UnauthorizedException('Lỗi đăng nhập')
    }

    return true;
  }
}
