import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from "@nestjs/jwt";
import { Repository } from 'typeorm';
import * as bcrypt from "bcrypt";

import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository( User ) private readonly userRepository: Repository<User>,
    private readonly jwtService : JwtService
  ){ }

  /**
   * It creates a new user and saves it to the database
   * @param {CreateUserDto} createAuthDto - CreateUserDto
   * @returns The user object is being returned.
   */
  async create( createAuthDto: CreateUserDto ) {

    try {

      const { password, ...userData } = createAuthDto;
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync( password, 7 )
      });

      await this.userRepository.save( user );
      delete user.password;

      return { ...user, token: this.getJwtoken({ email: user.email}) };
    } catch (error) {
      this.handleErrors( error );
    }
  }

  /**
   * It takes a loginUserDto object, which is a TypeScript class that has two properties: email and
   * password. It then uses the email property to find a user in the database. If the user is found, it
   * compares the password property of the loginUserDto object to the password property of the user
   * object. If the passwords match, it returns the user object. If the passwords don't match, it
   * throws an UnauthorizedException
   * @param {LoginUserDto} loginUserDto - LoginUserDto - This is the DTO that we created earlier.
   * @returns The user object is being returned.
   */
  async login( loginUserDto: LoginUserDto ) {

    const { password, email } = loginUserDto;

    const user = await this.userRepository.findOne({
      where : { email },
      select: { email: true, password: true },
    });

    if( !user) 
    throw new UnauthorizedException("Credentials are not found");

    if( !bcrypt.compareSync(password, user.password ) ) 
    throw new UnauthorizedException("Credentials are not found");

    return { ...user, token: this.getJwtoken({ email: user.email}) };
  }

  /**
   * It takes a payload object, signs it with the jwtService, and returns the token
   * @param {JwtPayload} payload - JwtPayload - this is the object that will be used to create the token.
   * @returns A JWT token
   */
  private getJwtoken( payload: JwtPayload ) : string  {
    const token = this.jwtService.sign( payload );
    return token;
  }
  
  /**
   * If the error code is 23505, throw a BadRequestException with the error detail. Otherwise, throw an
   * InternalServerErrorException
   * @param {any} error - The error object that was thrown.
   */
  private handleErrors( error:any ) : never {

    if( error.code === '23505' ) throw new BadRequestException(`${error.detail }`);

    throw new InternalServerErrorException('Check server logs');
    
  }

}
