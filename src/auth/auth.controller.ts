import { Controller, Post, Body, Get, UseGuards, Req, SetMetadata } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { CreateUserDto, LoginUserDto } from './dto/index';
import { GetUser } from './decorators/get-user.decorators';
import { UserRolesGuard } from './guards/user-roles.guard';
import { RawHeaders } from './decorators/raw-headers-decorators';
import { RoleProtected } from './decorators/role-protected.decorator';
import { ValidRoles } from './interfaces/valid-roles';
import { Auth } from './decorators/auth.decorator';

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

  /* A post request to the login route. It is using the loginUserDto to login a user. */
  @Post('login')
  login( @Body() loginUserDto: LoginUserDto ) {
    return this.authService.login( loginUserDto );
  }

  @Get('check-status')
  @Auth()
  checkAuthStatus( @GetUser() user : User ) {
    return this.authService.checkAuthStatu( user );
  }

  @Get('private')
  @UseGuards( AuthGuard() )
  testingPrivateRoute( 
    @Req() request : Express.Request,
    @GetUser() user: User,
    @GetUser('email') userEmail: User,
    @RawHeaders() rawHeaders : string[]
  ) {
    
    return {
      ok      : true,
      message : 'Hola que hace',
      user,
      userEmail,
      rawHeaders
    }
  }
  
  // @SetMetadata( 'roles', ['admin', 'super-user'] )
  @Get('private2')
  @RoleProtected( ValidRoles.admin, ValidRoles.user, ValidRoles.superUser )
  @UseGuards( AuthGuard(), UserRolesGuard )
  privateRpute2(
    @GetUser() user : User,
  ) {

    return {
      ok: true, 
      user
    }

  }

  @Get('private3')
  @Auth( ValidRoles.superUser, ValidRoles.user )
  privateRpute3( @GetUser() user : User ) {

    return {
      ok: true, 
      user
    }

  }

}
