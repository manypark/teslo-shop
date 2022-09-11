import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
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
    private readonly productImageRepository : Repository<ProductImage>,

    private readonly dataSource:DataSource,
  ) {}

  async create( createProductDto : CreateProductDto ) {

    try {

      const { images = [], ...productDetails } = createProductDto;

      const product = this.productRepository.create( { 
          ...productDetails,
          images: images.map( image => this.productImageRepository.create({ url: image }) )
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

  async update( idProduct: string, updateProductDto: UpdateProductDto ) {

    const { images, ...toUpdate } = updateProductDto;

    const product = await this.productRepository.preload({ id: idProduct, ...toUpdate });

    if( !product ) throw new NotFoundException(`Product with id: ${idProduct} not found`);

    // query runner
    const query = this.dataSource.createQueryRunner();
    //conexion a db
    await query.connect();
    //se empieza las transacciones
    await query.startTransaction();

    try {

      // se valida si vienen nuevas imagenes
      if ( images ) {
        await query.manager.delete( ProductImage, { product: { id: idProduct } } );
        product.images = images.map( img => this.productImageRepository.create( { url: img }) );
      }

      await query.manager.save( product );

      await query.commitTransaction();
      await query.release();

      // await this.productRepository.save( product );

      // return product;

      // para que se vena las iamgenes cuando no se manda en el json para actualizar
      return this.findOnePlain( idProduct );

    } catch (error) {

      await query.rollbackTransaction();
      await query.release();

      this.handleErrors( error );
    }

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

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');

    try {

      return await query
      .delete()
      .where({})
      .execute();
      
    } catch (error) {
      this.handleErrors(error);
    }

  }

}
