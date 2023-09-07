import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { FilesService } from './files.service';
import { AuthModule } from 'src/auth/auth.module';
import { FilesController } from './files.controller';

@Module({
  controllers: [FilesController],
  providers: [FilesService],
  imports:[ 
    ConfigModule,
    AuthModule
  ]
})
export class FilesModule {}
