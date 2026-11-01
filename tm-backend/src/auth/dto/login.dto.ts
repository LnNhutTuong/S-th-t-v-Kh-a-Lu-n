import { IsNotEmpty, IsEmail } from 'class-validator';

export class PasswordlessLoginDTO {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}