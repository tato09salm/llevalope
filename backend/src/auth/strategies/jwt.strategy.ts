import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

const extractJwtFromCookie = (req: { headers?: { cookie?: string } }) => {
  const cookieHeader = req?.headers?.cookie;
  if (!cookieHeader) return null;

  const tokenPair = cookieHeader
    .split(';')
    .map((value) => value.trim())
    .find((value) => value.startsWith('llevalope_token='));

  return tokenPair ? decodeURIComponent(tokenPair.split('=')[1]) : null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        extractJwtFromCookie,
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    return { id: payload.sub, correo: payload.correo, rol: payload.rol };
  }
}
