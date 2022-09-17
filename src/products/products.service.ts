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

  /**
   * We're creating a new product, and then saving it to the database
   * @param {CreateProductDto} createProductDto - CreateProductDto
   * @returns The product object with the images array.
   */
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

  /**
   * It takes a paginationDTO object, destructures it to get the limit and offset values, then uses
   * those values to query the database for products, and returns the products
   * @param {PaginationDto} paginationDTO - This is the object that will be passed in from the controller.
   * @returns - The products array is being returned.
   *   - The products array is being mapped to return a new array.
   *   - The new array is being returned.
   */
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

  /**
   * It takes a string as an argument, checks if it's a valid UUID, if it is, it searches for a product
   * by id, if it's not, it searches for a product by title or slug
   * @param {string} term - string - The term to search for.
   * @returns A product object
   */
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

  /**
   * It takes a term, finds a product, and returns the product with the images array replaced by an
   * array of image URLs
   * @param {string} term - The term to search for.
   * @returns The product object with the images array mapped to only return the url.
   */
  async findOnePlain( term:string ) {
    const { images = [], ...product } = await this.findOne( term );
    return { ...product, images: images.map( img => img.url ) };
  }

  /**
   * We're using a query runner to start a transaction, then we're deleting all the images associated
   * with the product, then we're saving the product, then we're committing the transaction, then we're
   * releasing the query runner
   * @param {string} idProduct - string
   * @param {UpdateProductDto} updateProductDto - UpdateProductDto
   * @returns The product with the updated information.
   */
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

  /**
   * It removes a product from the database
   * @param {string} id - string - The id of the product to be deleted.
   */
  async remove( id: string ) {
    await this.productRepository.remove( await this.findOne( id ) );
  }

  /**
   * If the error code is 23505, throw a BadRequestException, otherwise throw an
   * InternalServerErrorException
   * @param {any} error - The error object that was thrown
   */
  private handleErrors( error:any ) {
    if( error.code === '23505')
      throw new BadRequestException(error.detail);

      this.logger.error(error);
      throw new InternalServerErrorException("Unexpected error, check logs");
  }

  /**
   * It deletes all products from the database
   * @returns The number of rows deleted.
   */
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