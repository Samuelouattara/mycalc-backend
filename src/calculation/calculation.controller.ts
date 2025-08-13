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
  CalculationDto,
  UserOperatorsResponseDto
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
  @ApiOperation({ summary: 'Obtenir l\'historique paginé des calculs d\'un utilisateur avec filtrage optionnel par opérateur' })
  @ApiParam({ name: 'userId', description: 'ID de l\'utilisateur', type: 'number' })
  @ApiQuery({ name: 'page', description: 'Numéro de page (défaut: 1)', required: false, type: 'string' })
  @ApiQuery({ 
    name: 'operator', 
    description: 'Filtrer par opérateur. Valeurs acceptées: +, -, *, /, sin, cos, tan, chain. Note: Utilisez %2B pour encoder le + dans l\'URL', 
    required: false, 
    type: 'string',
    example: '+'
  })
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
    @Param('userId') userId: string,
    @Query('page') page: string,
    @Query('operator') operator?: string
  ) {
    // Validation et conversion de l'userId
    const userIdNum = parseInt(userId, 10);
    if (isNaN(userIdNum)) {
      throw new BadRequestException('ID utilisateur invalide');
    }

    const user = await this.userService.findById(userIdNum);
    if (!user) throw new BadRequestException('Utilisateur non trouvé');
    
    const pageNum = parseInt(page, 10) || 1;
    const pageSize = 5;
    let allHistory = await this.calculationService.findByUser(userIdNum);
    
    // Filtrer par opérateur si spécifié
    if (operator) {
      console.log('Filtrage par opérateur reçu:', `"${operator}"`);
      console.log('Longueur de l\'opérateur:', operator.length);
      console.log('Codes ASCII:', Array.from(operator).map(c => c.charCodeAt(0)));
      console.log('Calculs avant filtrage:', allHistory.map(c => ({ id: c.id, operator: `"${c.operator}"` })));
      
      // Gestion spéciale pour les opérateurs qui peuvent être mal encodés
      let searchOperator = operator;
      
      // Si l'opérateur reçu est un espace ou vide, on cherche '+'
      if (operator === ' ' || operator === '' || operator === '%20') {
        searchOperator = '+';
      }
      
      // Si l'opérateur reçu est '+' mais qu'il y a un problème d'encodage
      if (operator === '+' || operator === '%2B') {
        searchOperator = '+';
      }
      
      console.log('Opérateur de recherche:', `"${searchOperator}"`);
      
      allHistory = allHistory.filter(calc => {
        const matches = calc.operator === searchOperator;
        console.log(`Calcul ${calc.id}: operator="${calc.operator}" === "${searchOperator}" = ${matches}`);
        return matches;
      });
      console.log('Calculs après filtrage:', allHistory.length);
    }
    
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
    @Param('userId') userId: string,
    @Body() body: CreateCalculationDto,
  ) {
    const userIdNum = parseInt(userId, 10);
    if (isNaN(userIdNum)) {
      throw new BadRequestException('ID utilisateur invalide');
    }

    const user = await this.userService.findById(userIdNum);
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
  async getUserCalculations(@Param('userId') userId: string) {
    const userIdNum = parseInt(userId, 10);
    if (isNaN(userIdNum)) {
      throw new BadRequestException('ID utilisateur invalide');
    }

    const user = await this.userService.findById(userIdNum);
    if (!user) throw new BadRequestException('Utilisateur non trouvé');
    return this.calculationService.findByUser(userIdNum);
  }

  @Get(':userId/operators')
  @ApiOperation({ summary: 'Obtenir tous les opérateurs utilisés par un utilisateur avec leur nombre d\'occurrences' })
  @ApiParam({ name: 'userId', description: 'ID de l\'utilisateur', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'Opérateurs récupérés avec succès',
    type: UserOperatorsResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Utilisateur non trouvé'
  })
  async getUserOperators(@Param('userId') userId: string) {
    const userIdNum = parseInt(userId, 10);
    if (isNaN(userIdNum)) {
      throw new BadRequestException('ID utilisateur invalide');
    }

    const user = await this.userService.findById(userIdNum);
    if (!user) throw new BadRequestException('Utilisateur non trouvé');
    
    const allHistory = await this.calculationService.findByUser(userIdNum);
    const operators = [...new Set(allHistory.map(calc => calc.operator))];
    
    return {
      userId: userIdNum,
      totalCalculations: allHistory.length,
      operators: operators.map(op => ({
        operator: op,
        count: allHistory.filter(calc => calc.operator === op).length
      }))
    };
  }
}

// Remove duplicate and unused functions outside the class

