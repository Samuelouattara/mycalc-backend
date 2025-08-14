import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  async deleteById(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }
  async updateUser(id: number, email?: string, password?: string, Nom?: string): Promise<User | undefined> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) return undefined;
    if (email) {
      // Vérifier si l'email est déjà utilisé par un autre utilisateur
      const existing = await this.userRepository.findOne({ where: { email } });
      if (existing && existing.id !== id) throw new Error('Email déjà utilisé');
      user.email = email;
    }
    if (password) user.password = password;
    if (Nom) user.Nom = Nom;
    return this.userRepository.save(user);
  }
  async findById(id: number): Promise<User | undefined> {
  const user = await this.userRepository.findOne({ where: { id } });
  return user ?? undefined;
  }
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(email: string, password: string, Nom: string, icon?: number): Promise<User> {
    const user = this.userRepository.create({ email, password, Nom, icon });
    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.userRepository.findOne({ where: { email } });
    return user ?? undefined;
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async deleteAll(): Promise<void> {
    await this.userRepository.clear();
  }
}
