import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { initialData } from './data/seed-data';
import { User } from 'src/auth/entities/user.entity';
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class SeedService {

  constructor(
    private readonly productsService: ProductsService,
    @InjectRepository( User ) private readonly userRepository : Repository<User>
  ){}
  
  async runSeed() {
    await this.deleteTables();
    const adminUser = await this.insertUsers();
    await this.insertNewProduct( adminUser );
    return 'SEED EXECUTED';
  }

  private async insertUsers() {

    const seedUser = initialData.users;

    const users : User[] = [];

    seedUser.forEach( user => {
      users.push( this.userRepository.create( user ) );
    });

    const dbUser = await this.userRepository.save( seedUser );

    return dbUser[0];
  }

  private async deleteTables( ) {
    await this.productsService.deleteAllProducts();

    const query = this.userRepository.createQueryBuilder();

    await query.delete().where({}).execute();
  }

  private async insertNewProduct( user : User ) {

    await this.productsService.deleteAllProducts();

    const { products } = initialData;

    const insertPromice = [];

    products.forEach( product => {
      insertPromice.push( this.productsService.create( product, user ) );
    });

    await Promise.all( insertPromice );

    return true;
  }

}
