import { Controller, Get } from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/auth/interfaces/valid-roles';
import { SeedService } from './seed.service';

@Controller('seed')
export class SeedController {

  constructor(
    private readonly seedService: SeedService,
  ) {}

  @Get()
  // @Auth( ValidRoles.admin )
  findAll() {
    return this.seedService.runSeed();
  }

}
