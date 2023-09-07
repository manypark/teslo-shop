import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';

import { ProductsService } from './products.service';
import { PaginationDto } from 'src/common/pagination.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/auth/interfaces/valid-roles';
import { GetUser } from 'src/auth/decorators/get-user.decorators';
import { User } from 'src/auth/entities/user.entity';

@Controller('products')
export class ProductsController {

  constructor( 
    private readonly productsService: ProductsService
  ) { }

  /* A POST request to the route /products. It is expecting a CreateProductDto object in the body of
  the request. It is calling the create method in the productsService and passing in the
  CreateProductDto object. */
  @Post()
  @Auth()
  create( 
    @Body() createProductDto : CreateProductDto,
    @GetUser() user : User
  ) {
    return this.productsService.create( createProductDto, user );
  }

  /* A GET request to the route /products. It is expecting a PaginationDto object in the query string
  of the request. It is calling the findAll method in the productsService and passing in the
  PaginationDto object. */
  @Get()
  @Auth()
  findAll( @Query() paginationDto:PaginationDto ) {
    return this.productsService.findAll( paginationDto );
  }

  /* A GET request to the route /products/:term. It is expecting a string in the route
  parameter :term. It is calling the findOnePlain method in the productsService and passing in the
  string. */
  @Get(':term')
  @Auth()
  findOne(@Param('term' ) term: string) {
    return this.productsService.findOnePlain( term );
  }

  /* A PATCH request to the route /products/:id. It is expecting a string in the route
    parameter :id and an UpdateProductDto object in the body of the request. It is calling the
  update
    method in the productsService and passing in the string and UpdateProductDto object. */
  @Patch(':id')
  @Auth( ValidRoles.admin )
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @GetUser() user : User
  ) {
    return this.productsService.update( id, updateProductDto, user );
  }

  /* A DELETE request to the route /products/:id. It is expecting a string in the route
  parameter :id. It is calling the remove method in the productsService and passing in the
  string. */
  @Delete(':id')
  @Auth( ValidRoles.admin )
  remove(@Param('id', ParseUUIDPipe ) id: string) {
    return this.productsService.remove( id );
  }

}
