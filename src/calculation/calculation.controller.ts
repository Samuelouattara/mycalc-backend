import { Controller, Post, Body, Param, Get, BadRequestException, Query } from '@nestjs/common';
import { CalculationService } from './calculation.service';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';

@Controller('calculations')
export class CalculationController {
  constructor(
    private readonly calculationService: CalculationService,
    private readonly userService: UserService,
  ) {}

  @Post('compute')
  async compute(@Body() body: { expression1: number; operator: string; expression2: number; userId?: number }) {
    const { expression1, operator, expression2, userId } = body;
    try {
      const result = this.calculationService.compute(expression1, operator, expression2);
      let user: User | undefined = undefined;
      if (userId !== undefined) {
        user = await this.userService.findById(userId);
        if (!user) throw new BadRequestException('Utilisateur non trouvé');
      }
      let expression = '';
      if (["sin", "cos", "tan"].includes(operator)) {
        expression = `${operator}(${expression1})`;
      } else {
        expression = `${expression1} ${operator} ${expression2}`;
      }
  await this.calculationService.create(user, expression, result.toString(), operator);
  return { result, operator };
    } catch (error) {
      throw new BadRequestException(error.message || 'Erreur de calcul');
    }
  }

  @Post('chain')
  async computeChain(@Body() body: { expression: string; userId?: number }) {
    const { expression, userId } = body;
    try {
      let user: User | undefined = undefined;
      if (userId !== undefined) {
        user = await this.userService.findById(userId);
        if (!user) throw new BadRequestException('Utilisateur non trouvé');
      }
      const result = this.calculationService.computeExpression(expression);
      // Détection du nombre d'opérateurs
      let operator = 'chain';
      const trigMatches = expression.match(/\b(sin|cos|tan)\b/g) || [];
      const arithMatches = expression.match(/[+\-*/]/g) || [];
      const totalOps = trigMatches.length + arithMatches.length;
      if (totalOps === 1) {
        operator = trigMatches[0] ? trigMatches[0] : (arithMatches[0] ? arithMatches[0] : '');
      }
      await this.calculationService.create(user, expression, result.toString(), operator);
      return { result, operator };
    } catch (error) {
      throw new BadRequestException(error.message || 'Erreur de calcul en chaîne');
    }
  }

  @Get('history/:userId')
  async getUserCalculationHistory(
    @Param('userId') userId: number,
    @Query('page') page: string
  ) {
    const user = await this.userService.findById(userId);
    if (!user) throw new BadRequestException('Utilisateur non trouvé');
    const pageNum = parseInt(page, 10) || 1;
    const pageSize = 5;
    const allHistory = await this.calculationService.findByUser(userId);
    const total = allHistory.length;
    const history = allHistory.slice((pageNum - 1) * pageSize, pageNum * pageSize);
    return {
      total,
      page: pageNum,
      pageSize,
      history
    };
  }

  @Post(':userId')
  async createCalculation(
    @Param('userId') userId: number,
    @Body() body: { expression: string; result: string },
  ) {
    const user = await this.userService.findById(userId);
    if (!user) throw new BadRequestException('Utilisateur non trouvé');
    return this.calculationService.create(user, body.expression, body.result);
  }

  @Get(':userId')
  async getUserCalculations(@Param('userId') userId: number) {
    const user = await this.userService.findById(userId);
    if (!user) throw new BadRequestException('Utilisateur non trouvé');
    return this.calculationService.findByUser(userId);
  }
}

// Remove duplicate and unused functions outside the class

