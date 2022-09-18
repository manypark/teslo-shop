import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  controllers: [
    AuthController
  ],
  providers: [
    AuthService,
    JwtStrategy
  ],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([ User ]),
    PassportModule.register({
      defaultStrategy: 'jwt'
    }),
    JwtModule.registerAsync({
      imports : [ ConfigModule, ConfigModule ],
      inject  : [ ConfigService ],
      useFactory: ( configServices : ConfigService ) => {
        // secret      : process.env.JWT_SECRET,
        return {
            secret      : configServices.get('JWT_SECRET'),
            signOptions : { expiresIn: '1h' },
          }
      }
    }),
  ],
  exports: [
    TypeOrmModule,
    JwtStrategy,
    PassportModule,
    JwtModule,
  ]
})

export class AuthModule {}
