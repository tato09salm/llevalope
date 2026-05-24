import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('registrar')
  async registrar(@Body() dto: RegisterDto) {
    return this.authService.registrar(dto);
  }

  @Post('iniciar-sesion')
  async iniciarSesion(@Body() dto: LoginDto) {
    return this.authService.iniciarSesion(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('perfil')
  async perfil(@Request() req) {
    return this.authService.perfil(req.user.id);
  }
}
