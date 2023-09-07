import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException, Get, Param, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from "multer";

import { FilesService } from './files.service';
import { fileFilter, fileFilterNamer } from './helpers/index';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('files')
export class FilesController {

  constructor(
    private readonly filesService   : FilesService,
    private readonly configServices : ConfigService
  ) { }

  @Get('product/:imageName')
  findProductImage( @Res() res: Response,  @Param('imageName') imageName:string ) {
    
    const path = this.filesService.getStaticProductImage( imageName );

    res.sendFile( path );
  }

  @Post('product')
  @Auth()
  @UseInterceptors( FileInterceptor('file', {
    fileFilter : fileFilter,
    storage   : diskStorage({
      destination: './static/uploads',
      filename    : fileFilterNamer
    }),
  }) )
  fileUpload( @UploadedFile() file: Express.Multer.File ) {

    if( !file ) throw new BadRequestException("Not image");

    const secureUrl = `${this.configServices.get('HOST_API')}/files/product/${file.filename}`;
    
    return { secureUrl };
  }

}
