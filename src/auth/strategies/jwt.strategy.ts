import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Repository } from 'typeorm';

import { User } from '../entities/user.entity';
import { JwtPayload } from '../interfaces/jwt-payload';

@Injectable()
export class JwtStrategy extends PassportStrategy( Strategy ) {

    constructor(
        @InjectRepository( User ) private readonly userRepository:Repository< User >,
        configServices : ConfigService ,
    ){
        super({
            secretOrKey     : configServices.get('JWT_SECRET'),
            jwtFromRequest  : ExtractJwt.fromAuthHeaderAsBearerToken(),
        });
    }


    /**
     * It takes a JwtPayload object as a parameter, and returns a Promise of a User object
     * @param {JwtPayload} payload - JwtPayload - The payload that was passed to the JWT when it was
     * created.
     * @returns The user object
     */
    async validate ( payload : JwtPayload ): Promise<User> {

        const { id } = payload;
        const user = await this.userRepository.findOneBy({ id });

        if( !user ) throw new UnauthorizedException('Token not valid');

        if( !user.isActive ) throw new UnauthorizedException('User is inactive');

        return user;
    }

}