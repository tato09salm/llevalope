import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Correo inválido' })
  correo: string;

  @IsString()
  contrasena: string;
}
