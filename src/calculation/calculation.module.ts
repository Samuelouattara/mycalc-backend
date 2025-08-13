import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Calculation } from './calculation.entity';
import { CalculationService } from './calculation.service';
import { CalculationController } from './calculation.controller';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';

@Module({
  imports: [TypeOrmModule.forFeature([Calculation, User])],
  providers: [CalculationService, UserService],
  controllers: [CalculationController],
  exports: [CalculationService],
})
export class CalculationModule {}
