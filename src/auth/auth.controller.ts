import { Controller, Post, Body } from '@nestjs/common';

import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('auth')
export class AuthController {

  constructor(
    private readonly authService: AuthService,
  ) {}

  /* A post request to the register route. It is using the createAuthDto to create a new user. */
  @Post('register')
  create(@Body() createAuthDto: CreateUserDto ) {
    return this.authService.create(createAuthDto);
  }

}
