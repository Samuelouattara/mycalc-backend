import { Controller, Post, Body, BadRequestException, Get, Delete, Param, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() body: { email: string; password: string; Nom: string; icon?: number }) {
    const existing = await this.userService.findByEmail(body.email);
    if (existing) throw new BadRequestException('Email déjà utilisé');
    return this.userService.create(body.email, body.password, body.Nom, body.icon);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
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
  async findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    const user = await this.userService.findById(id);
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    return user;
  }
  @Delete()
  async deleteAll() {
    await this.userService.deleteAll();
    return { message: 'Tous les utilisateurs ont été supprimés.' };
  }
}
