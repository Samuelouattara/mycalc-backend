import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  async findById(id: number): Promise<User | undefined> {
  const user = await this.userRepository.findOne({ where: { id } });
  return user ?? undefined;
  }
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(email: string, password: string, Nom: string, icon?: string): Promise<User> {
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
