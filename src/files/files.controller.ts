import { Controller, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {

  constructor(
    private readonly filesService: FilesService
  ) {

  }

  @Post('product')
  @UseInterceptors( FileInterceptor('file') )
  fileUpload( @UploadedFile() file: Express.Multer.File ) {
    return file;
  }

}
