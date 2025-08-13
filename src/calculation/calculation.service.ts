import { Injectable } from '@nestjs/common';
import { evaluate } from 'mathjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Calculation } from './calculation.entity';
import { User } from '../user/user.entity';

@Injectable()
export class CalculationService {
  constructor(
    @InjectRepository(Calculation)
    private calculationRepository: Repository<Calculation>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(user: User | undefined, expression: string, result: string, operator?: string): Promise<Calculation> {
    const calculation = this.calculationRepository.create({
      expression,
      result,
      operator: operator ?? '',
      user,
    });
    const savedCalculation = await this.calculationRepository.save(calculation);
    if (user) {
      user.calculationsCount = (user.calculationsCount || 0) + 1;
      await this.userRepository.save(user);
    }
    return savedCalculation;
  }

  computeExpression(expression: string): number {
    try {
      // mathjs attend les fonctions en radians, donc on convertit sin(x) en sin(x deg)
      // mathjs supporte 'sin(30 deg)' pour les degrés
      // On remplace sin(x), cos(x), tan(x) par sin(x deg), etc. si x est un nombre
      const expr = expression.replace(/(sin|cos|tan)\((\d+(\.\d+)?)\)/g, '$1($2 deg)');
      return evaluate(expr);
    } catch (error) {
      throw new Error('Expression invalide ou non supportée');
    }
  }

  async findByUser(userId: number): Promise<Calculation[]> {
    return this.calculationRepository.find({ where: { user: { id: userId } }, order: { createdAt: 'DESC' } });
  }

  compute(expression1: number, operator: string, expression2?: number): number {
    switch (operator) {
      case '+':
        return expression1 + (expression2 ?? 0);
      case '-':
        return expression1 - (expression2 ?? 0);
      case '*':
        return expression1 * (expression2 ?? 1);
      case '/':
        if (expression2 === 0) throw new Error('Division par zéro');
        return expression1 / (expression2 ?? 1);
      case 'sin':
        // expression1 en degrés
        return Math.sin(expression1 * Math.PI / 180);
      case 'cos':
        return Math.cos(expression1 * Math.PI / 180);
      case 'tan':
        return Math.tan(expression1 * Math.PI / 180);
      default:
        throw new Error('Opérateur non supporté');
    }
  }
}
