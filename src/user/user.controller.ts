import { Controller, Post, Body, BadRequestException, Get, Delete, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CalculationService } from '../calculation/calculation.service';
import { 
  RegisterUserDto, 
  LoginUserDto, 
  LoginResponseDto, 
  UserDto, 
  DeleteAllResponseDto 
} from '../dto/user.dto';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly calculationService: CalculationService
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Inscrire un nouvel utilisateur' })
  @ApiResponse({ 
    status: 201, 
    description: 'Utilisateur créé avec succès',
    type: UserDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Email déjà utilisé'
  })
  async register(@Body() body: RegisterUserDto) {
    const existing = await this.userService.findByEmail(body.email);
    if (existing) throw new BadRequestException('Email déjà utilisé');
    return this.userService.create(body.email, body.password, body.Nom, body.icon);
  }

  @Post('login')
  @ApiOperation({ summary: 'Connecter un utilisateur' })
  @ApiResponse({ 
    status: 200, 
    description: 'Connexion réussie',
    type: LoginResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Email ou mot de passe incorrect'
  })
  async login(@Body() body: LoginUserDto) {
    const user = await this.userService.findByEmail(body.email);
    if (!user || user.password !== body.password) {
      throw new BadRequestException('Email ou mot de passe incorrect');
    }
    return {
      message: 'Connexion réussie',
      userId: user.id,
      nom: user.Nom
    };
  }

  @Get()
  @ApiOperation({ summary: 'Obtenir tous les utilisateurs' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste des utilisateurs récupérée avec succès',
    type: [UserDto]
  })
  async findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un utilisateur par ID' })
  @ApiParam({ name: 'id', description: 'ID de l\'utilisateur', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: 'Utilisateur récupéré avec succès',
    type: UserDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Utilisateur non trouvé'
  })
  async findOne(@Param('id') id: number) {
    const user = await this.userService.findById(id);
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    return user;
  }
  @Delete()
  @ApiOperation({ summary: 'Supprimer tous les utilisateurs' })
  @ApiResponse({ 
    status: 200, 
    description: 'Tous les utilisateurs supprimés avec succès',
    type: DeleteAllResponseDto
  })
  async deleteAll() {
    await this.userService.deleteAll();
    return { message: 'Tous les utilisateurs ont été supprimés.' };
  }

  @Get('dashboard/top')
  @ApiOperation({ summary: 'Obtenir les 3 utilisateurs qui font le plus de calculs' })
  @ApiResponse({ 
    status: 200, 
    description: 'Top 3 utilisateurs par nombre de calculs',
    type: [UserDto]
  })
  async getTopUsers(): Promise<UserDto[]> {
    const users = await this.userService.findAll();
    const userWithCount = await Promise.all(users.map(async (u) => {
      const history = await this.calculationService.findByUser(u.id);
      return { ...u, totalCalculations: history.length };
    }));
    const sorted = userWithCount.sort((a, b) => b.totalCalculations - a.totalCalculations);
    return sorted.slice(0, 3);
  }

    @Get('dashboard/types/calculs')
    @ApiOperation({ summary: 'Obtenir le nombre total de calculs et le nombre par type d’opération' })
    @ApiResponse({ 
      status: 200, 
      description: 'Stats globales des calculs',
    })
    async getCalculTypesStats() {
      const allCalculs = await this.calculationService.findAll();
      const total = allCalculs.length;
      const typesCount: Record<string, number> = {};
      for (const calc of allCalculs) {
        const op = calc.operator || 'inconnu';
        typesCount[op] = (typesCount[op] || 0) + 1;
      }
      return { total, types: typesCount };
    }


}