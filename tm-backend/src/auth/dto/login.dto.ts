import { IsNotEmpty, IsEmail, Matches } from 'class-validator';

const AGU_EMAIL_REGEX = /^[^\s@]+@st  udent.agu\.edu\.vn$/i;

export class PasswordlessLoginDTO {
  @Matches(AGU_EMAIL_REGEX, {message: 'Only AGU student email is allowed'})
  @IsEmail()
  @IsNotEmpty()
  email: string;
}