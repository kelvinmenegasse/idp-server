import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  secret: process.env.JWT_SECRET,
  expires: process.env.JWT_EXPIRES,
}));
