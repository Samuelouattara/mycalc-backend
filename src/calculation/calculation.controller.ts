import { Controller, Post, Body, Param, Get, BadRequestException, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CalculationService } from './calculation.service';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import { 
  ComputeCalculationDto, 
  ChainCalculationDto, 
  CreateCalculationDto, 
  CalculationResponseDto, 
  CalculationHistoryResponseDto,
  CalculationDto 
} from '../dto/calculation.dto';

@ApiTags('calculations')
@Controller('calculations')
export class CalculationController {
  constructor(
    private readonly calculationService: CalculationService,
    private readonly userService: UserService,
  ) {}

  @Post('compute')
  @ApiOperation({ summary: 'Effectuer un calcul simple' })
  @ApiResponse({ 
    status: 200, 
    description: 'Calcul effectué avec succès',
    type: CalculationResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Erreur de calcul ou utilisateur non trouvé'
  })
  async compute(@Body() body: ComputeCalculationDto) {
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
      throw new BadRequestException((error as Error).message || 'Erreur de calcul');
    }
  }

  @Post('chain')
  @ApiOperation({ summary: 'Effectuer un calcul en chaîne' })
  @ApiResponse({ 
    status: 200, 
    description: 'Calcul en chaîne effectué avec succès',
    type: CalculationResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Erreur de calcul ou utilisateur non trouvé'
  })
  async computeChain(@Body() body: ChainCalculationDto) {
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
      throw new BadRequestException((error as Error).message || 'Erreur de calcul en chaîne');
    }
  }

  @Get('history/:userId')
  @ApiOperation({ summary: 'Obtenir l\'historique paginé des calculs d\'un utilisateur' })
  @ApiParam({ name: 'userId', description: 'ID de l\'utilisateur', type: 'number' })
  @ApiQuery({ name: 'page', description: 'Numéro de page', required: false, type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Historique des calculs récupéré avec succès',
    type: CalculationHistoryResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Utilisateur non trouvé'
  })
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
  @ApiOperation({ summary: 'Créer un calcul pour un utilisateur' })
  @ApiParam({ name: 'userId', description: 'ID de l\'utilisateur', type: 'number' })
  @ApiResponse({ 
    status: 201, 
    description: 'Calcul créé avec succès',
    type: CalculationDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Utilisateur non trouvé'
  })
  async createCalculation(
    @Param('userId') userId: number,
    @Body() body: CreateCalculationDto,
  ) {
    const user = await this.userService.findById(userId);
    if (!user) throw new BadRequestException('Utilisateur non trouvé');
    return this.calculationService.create(user, body.expression, body.result);
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Obtenir tous les calculs d\'un utilisateur' })
  @ApiParam({ name: 'userId', description: 'ID de l\'utilisateur', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'Calculs récupérés avec succès',
    type: [CalculationDto]
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Utilisateur non trouvé'
  })
  async getUserCalculations(@Param('userId') userId: number) {
    const user = await this.userService.findById(userId);
    if (!user) throw new BadRequestException('Utilisateur non trouvé');
    return this.calculationService.findByUser(userId);
  }
}

// Remove duplicate and unused functions outside the class

