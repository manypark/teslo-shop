import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from "bcrypt";

import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository( User ) private readonly userRepository: Repository<User>
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

      return user;

    } catch (error) {
      console.log(error);
      this.handleErrors( error );
    }
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
