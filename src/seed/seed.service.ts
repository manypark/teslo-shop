import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {

  constructor(
    private readonly productsService: ProductsService,
  ){}
  
  async runSeed() {
    await this.insertNewProduct();
    return 'SEED EXECUTED';
  }

  private async insertNewProduct() {

    await this.productsService.deleteAllProducts();

    const { products } = initialData;

    const insertPromice = [];

    products.forEach( product => {
      insertPromice.push( this.productsService.create( product ) );
    });

    await Promise.all( insertPromice );

    return true;
  }

}
