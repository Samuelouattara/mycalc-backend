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
  @Get('divisions/:userId')
  @ApiOperation({ summary: 'Obtenir l’historique des divisions pour un utilisateur' })
  @ApiParam({ name: 'userId', type: Number })
  @ApiResponse({ status: 200, description: 'Liste des divisions', type: [CalculationDto] })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async getDivisions(@Param('userId') userId: number) {
    const user = await this.userService.findById(userId);
    if (!user) throw new BadRequestException('Utilisateur non trouvé');
    const divisions = await this.calculationService.findByUser(userId);
    return divisions.filter(calc => calc.operator === '/');
  }
  @Get('multiplications/:userId')
  @ApiOperation({ summary: 'Obtenir l’historique des multiplications pour un utilisateur' })
  @ApiParam({ name: 'userId', type: Number })
  @ApiResponse({ status: 200, description: 'Liste des multiplications', type: [CalculationDto] })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async getMultiplications(@Param('userId') userId: number) {
    const user = await this.userService.findById(userId);
    if (!user) throw new BadRequestException('Utilisateur non trouvé');
    const multiplications = await this.calculationService.findByUser(userId);
    return multiplications.filter(calc => calc.operator === '*');
  }
  @Get('subtractions/:userId')
  @ApiOperation({ summary: 'Obtenir l’historique des soustractions pour un utilisateur' })
  @ApiParam({ name: 'userId', type: Number })
  @ApiResponse({ status: 200, description: 'Liste des soustractions', type: [CalculationDto] })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async getSubtractions(@Param('userId') userId: number) {
    const user = await this.userService.findById(userId);
    if (!user) throw new BadRequestException('Utilisateur non trouvé');
    const subtractions = await this.calculationService.findByUser(userId);
    return subtractions.filter(calc => calc.operator === '-');
  }
  @Get('additions/:userId')
  @ApiOperation({ summary: 'Obtenir l’historique des additions pour un utilisateur' })
  @ApiParam({ name: 'userId', type: Number })
  @ApiResponse({ status: 200, description: 'Liste des additions', type: [CalculationDto] })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async getAdditions(@Param('userId') userId: number) {
    const user = await this.userService.findById(userId);
    if (!user) throw new BadRequestException('Utilisateur non trouvé');
    const additions = await this.calculationService.findByUser(userId);
    return additions.filter(calc => calc.operator === '+');
  }
  @Post('log')
  @ApiOperation({ summary: 'Calculer le logarithme décimal (log10) pour un utilisateur' })
  @ApiResponse({ status: 200, description: 'Calcul log effectué', type: CalculationResponseDto })
  @ApiResponse({ status: 400, description: 'Erreur de calcul ou utilisateur non trouvé' })
  async log(@Body() body: { x: number; userId?: number }) {
    const { x, userId } = body;
    try {
      if (x <= 0) throw new BadRequestException('Impossible de calculer log d’un nombre <= 0');
      const result = Math.log10(x);
      let user: User | undefined = undefined;
      if (userId !== undefined) {
        user = await this.userService.findById(userId);
        if (!user) throw new BadRequestException('Utilisateur non trouvé');
      }
      const expression = `log(${x})`;
      await this.calculationService.create(user, expression, result.toString(), 'log');
      return { result, operator: 'log' };
    } catch (error) {
      throw new BadRequestException((error as Error).message || 'Erreur de calcul');
    }
  }

  @Post('percent')
  @ApiOperation({ summary: 'Calculer le pourcentage pour un utilisateur' })
  @ApiResponse({ status: 200, description: 'Calcul pourcentage effectué', type: CalculationResponseDto })
  @ApiResponse({ status: 400, description: 'Erreur de calcul ou utilisateur non trouvé' })
  async percent(@Body() body: { x: number; userId?: number }) {
    const { x, userId } = body;
    try {
      const result = x / 100;
      let user: User | undefined = undefined;
      if (userId !== undefined) {
        user = await this.userService.findById(userId);
        if (!user) throw new BadRequestException('Utilisateur non trouvé');
      }
      const expression = `${x}%`;
      await this.calculationService.create(user, expression, result.toString(), '%');
      return { result, operator: '%' };
    } catch (error) {
      throw new BadRequestException((error as Error).message || 'Erreur de calcul');
    }
  }
  @Get('ans/:userId')
  @ApiOperation({ summary: 'Obtenir le dernier résultat de calcul pour un utilisateur' })
  @ApiParam({ name: 'userId', type: Number })
  @ApiResponse({ status: 200, description: 'Dernier résultat renvoyé', type: CalculationResponseDto })
  @ApiResponse({ status: 404, description: 'Utilisateur ou calcul non trouvé' })
  async ans(@Param('userId') userId: number) {
  const user = await this.userService.findById(userId);
  if (!user) throw new BadRequestException('Utilisateur non trouvé');
  // Cherche le dernier calcul de l'utilisateur
  const history = await this.calculationService.findByUser(userId);
  if (!history || history.length === 0) throw new BadRequestException('Aucun calcul trouvé');
  const lastCalc = history[0];
  return { result: lastCalc.result, operator: lastCalc.operator };
  }
  @Post('abs')
  @ApiOperation({ summary: 'Calculer la valeur absolue pour un utilisateur' })
  @ApiResponse({ status: 200, description: 'Calcul valeur absolue effectué', type: CalculationResponseDto })
  @ApiResponse({ status: 400, description: 'Erreur de calcul ou utilisateur non trouvé' })
  async abs(@Body() body: { x: number; userId?: number }) {
    const { x, userId } = body;
    try {
      const result = Math.abs(x);
      let user: User | undefined = undefined;
      if (userId !== undefined) {
        user = await this.userService.findById(userId);
        if (!user) throw new BadRequestException('Utilisateur non trouvé');
      }
      const expression = `abs(${x})`;
      await this.calculationService.create(user, expression, result.toString(), 'abs');
      return { result, operator: 'abs' };
    } catch (error) {
      throw new BadRequestException((error as Error).message || 'Erreur de calcul');
    }
  }
  @Post('pi')
  @ApiOperation({ summary: 'Obtenir la valeur de pi pour un utilisateur' })
  @ApiResponse({ status: 200, description: 'Valeur de pi renvoyée', type: CalculationResponseDto })
  @ApiResponse({ status: 400, description: 'Utilisateur non trouvé' })
  async pi(@Body() body: { userId?: number }) {
    const { userId } = body;
    try {
      const result = Math.PI;
      let user: User | undefined = undefined;
      if (userId !== undefined) {
        user = await this.userService.findById(userId);
        if (!user) throw new BadRequestException('Utilisateur non trouvé');
      }
      const expression = `pi`;
      await this.calculationService.create(user, expression, result.toString(), 'pi');
      return { result, operator: 'pi' };
    } catch (error) {
      throw new BadRequestException((error as Error).message || 'Erreur');
    }
  }
  @Post('exp')
  @ApiOperation({ summary: 'Calculer l’exponentielle pour un utilisateur' })
  @ApiResponse({ status: 200, description: 'Calcul exponentielle effectué', type: CalculationResponseDto })
  @ApiResponse({ status: 400, description: 'Erreur de calcul ou utilisateur non trouvé' })
  async exp(@Body() body: { x: number; userId?: number }) {
    const { x, userId } = body;
    try {
      const result = Math.exp(x);
      let user: User | undefined = undefined;
      if (userId !== undefined) {
        user = await this.userService.findById(userId);
        if (!user) throw new BadRequestException('Utilisateur non trouvé');
      }
      const expression = `exp(${x})`;
      await this.calculationService.create(user, expression, result.toString(), 'exp');
      return { result, operator: 'exp' };
    } catch (error) {
      throw new BadRequestException((error as Error).message || 'Erreur de calcul');
    }
  }
  @Post('rad')
  @ApiOperation({ summary: 'Convertir un angle en degrés vers radians pour un utilisateur' })
  @ApiResponse({ status: 200, description: 'Conversion degré -> radian effectuée', type: CalculationResponseDto })
  @ApiResponse({ status: 400, description: 'Erreur de calcul ou utilisateur non trouvé' })
  async rad(@Body() body: { x: number; userId?: number }) {
    const { x, userId } = body;
    try {
      const result = x * (Math.PI / 180);
      let user: User | undefined = undefined;
      if (userId !== undefined) {
        user = await this.userService.findById(userId);
        if (!user) throw new BadRequestException('Utilisateur non trouvé');
      }
      const expression = `${x} deg en rad`;
      await this.calculationService.create(user, expression, result.toString(), 'rad');
      return { result, operator: 'rad' };
    } catch (error) {
      throw new BadRequestException((error as Error).message || 'Erreur de calcul');
    }
  }
  @Post('deg')
  @ApiOperation({ summary: 'Convertir un angle en radians vers degrés pour un utilisateur' })
  @ApiResponse({ status: 200, description: 'Conversion radian -> degré effectuée', type: CalculationResponseDto })
  @ApiResponse({ status: 400, description: 'Erreur de calcul ou utilisateur non trouvé' })
  async deg(@Body() body: { x: number; userId?: number }) {
    const { x, userId } = body;
    try {
      const result = x * (180 / Math.PI);
      let user: User | undefined = undefined;
      if (userId !== undefined) {
        user = await this.userService.findById(userId);
        if (!user) throw new BadRequestException('Utilisateur non trouvé');
      }
      const expression = `${x} rad en deg`;
      await this.calculationService.create(user, expression, result.toString(), 'deg');
      return { result, operator: 'deg' };
    } catch (error) {
      throw new BadRequestException((error as Error).message || 'Erreur de calcul');
    }
  }
  @Post('ln')
  @ApiOperation({ summary: 'Calculer le logarithme népérien (ln) pour un utilisateur' })
  @ApiResponse({ status: 200, description: 'Calcul ln effectué', type: CalculationResponseDto })
  @ApiResponse({ status: 400, description: 'Erreur de calcul ou utilisateur non trouvé' })
  async ln(@Body() body: { x: number; userId?: number }) {
    const { x, userId } = body;
    try {
      if (x <= 0) throw new BadRequestException('Impossible de calculer ln d’un nombre <= 0');
      const result = Math.log(x);
      let user: User | undefined = undefined;
      if (userId !== undefined) {
        user = await this.userService.findById(userId);
        if (!user) throw new BadRequestException('Utilisateur non trouvé');
      }
      const expression = `ln(${x})`;
      await this.calculationService.create(user, expression, result.toString(), 'ln');
      return { result, operator: 'ln' };
    } catch (error) {
      throw new BadRequestException((error as Error).message || 'Erreur de calcul');
    }
  }
  @Post('sqrt')
  @ApiOperation({ summary: 'Calculer la racine carrée pour un utilisateur' })
  @ApiResponse({ status: 200, description: 'Calcul racine carrée effectué', type: CalculationResponseDto })
  @ApiResponse({ status: 400, description: 'Erreur de calcul ou utilisateur non trouvé' })
  async sqrt(@Body() body: { x: number; userId?: number }) {
    const { x, userId } = body;
    try {
      if (x < 0) throw new BadRequestException('Impossible de calculer la racine carrée d’un nombre négatif');
      const result = Math.sqrt(x);
      let user: User | undefined = undefined;
      if (userId !== undefined) {
        user = await this.userService.findById(userId);
        if (!user) throw new BadRequestException('Utilisateur non trouvé');
      }
      const expression = `√${x}`;
      await this.calculationService.create(user, expression, result.toString(), 'sqrt');
      return { result, operator: 'sqrt' };
    } catch (error) {
      throw new BadRequestException((error as Error).message || 'Erreur de calcul');
    }
  }
  @Post('square')
  @ApiOperation({ summary: 'Calculer x² pour un utilisateur' })
  @ApiResponse({ status: 200, description: 'Calcul x² effectué', type: CalculationResponseDto })
  @ApiResponse({ status: 400, description: 'Erreur de calcul ou utilisateur non trouvé' })
  async square(@Body() body: { value: number; userId?: number }) {
    const { value, userId } = body;
    try {
      const result = value * value;
      let user: User | undefined = undefined;
      if (userId !== undefined) {
        user = await this.userService.findById(userId);
        if (!user) throw new BadRequestException('Utilisateur non trouvé');
      }
      const expression = `${value}²`;
      await this.calculationService.create(user, expression, result.toString(), '^2');
      return { result, operator: '^2' };
    } catch (error) {
      throw new BadRequestException((error as Error).message || 'Erreur de calcul');
    }
  }
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

