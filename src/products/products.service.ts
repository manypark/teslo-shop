import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { validate as isUUID } from "uuid";

import { Product, ProductImage } from './entities/index';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/pagination.dto';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository( Product ) 
    private readonly productRepository : Repository<Product>,

    @InjectRepository( ProductImage ) 
    private readonly productIamgeRepository : Repository<ProductImage>,
  ) {}

  async create( createProductDto : CreateProductDto ) {

    try {

      const { images = [], ...productDetails } = createProductDto;

      const product = this.productRepository.create( { 
          ...productDetails,
          images: images.map( image => this.productIamgeRepository.create({ url: image }) )
        }
      );
      await this.productRepository.save( product );
      return { ...product, images };

    } catch ( error ) { this.handleErrors(error); }

  }

  async findAll( paginationDTO:PaginationDto ) {

    const  { limit = 10, offset = 0 } = paginationDTO;

    const products = await this.productRepository.find({ 
      take      : limit, 
      skip      : offset, 
      relations : {
        images: true
      }
    });

    return products.map( ({ images, ...product }) =>  ({
      ...product,
      images: images.map( img => img.url )
    }));
  }

  async findOne( term : string ) {

    let product: Product;

    if( isUUID( term.trim().toLowerCase() ) ) {
      product = await this.productRepository.findOneBy({ id : term.trim().toLowerCase() });
    } else {
      const query = this.productRepository.createQueryBuilder('prod');
      product = await query.where('LOWER(title)=:title or LOWER(slug) =:slug', {
        title : term.trim().toLowerCase(),
        slug  : term.trim().toLowerCase(),
      })
      .leftJoinAndSelect('prod.images', 'prodImages')
      .getOne();
    }
    
    if( !product ) throw new NotFoundException(`Product with id ${term} not found.`);
    return product;
  }

  async findOnePlain( term:string ) {
    const { images = [], ...product } = await this.findOne( term );
    return { ...product, images: images.map( img => img.url ) };
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const product = await this.productRepository.preload({ id: id, ...updateProductDto, images:[] });

    if( !product ) throw new NotFoundException(`Product with id: ${id} not found`);

    try {
      await this.productRepository.save( product );
    } catch (error) {
      this.handleErrors( error );
    }

    return product;
  }

  async remove( id: string ) {
    await this.productRepository.remove( await this.findOne( id ) );
  }

  private handleErrors( error:any ) {
    if( error.code === '23505')
      throw new BadRequestException(error.detail);

      this.logger.error(error);
      throw new InternalServerErrorException("Unexpected error, check logs");
  }

}
