import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional } from 'class-validator';

export class ComputeCalculationDto {
  @ApiProperty({
    description: 'Premier nombre de l\'opération',
    example: 10
  })
  @IsNumber()
  expression1!: number;

  @ApiProperty({
    description: 'Opérateur mathématique (+, -, *, /, sin, cos, tan)',
    example: '+',
    enum: ['+', '-', '*', '/', 'sin', 'cos', 'tan']
  })
  @IsString()
  operator!: string;

  @ApiProperty({
    description: 'Deuxième nombre de l\'opération (non requis pour les fonctions trigonométriques)',
    example: 5,
    required: false
  })
  @IsNumber()
  @IsOptional()
  expression2?: number;

  @ApiProperty({
    description: 'ID de l\'utilisateur (optionnel)',
    example: 1,
    required: false
  })
  @IsNumber()
  @IsOptional()
  userId?: number;
}

export class ChainCalculationDto {
  @ApiProperty({
    description: 'Expression mathématique complète à évaluer',
    example: '2 + 3 * 4'
  })
  @IsString()
  expression!: string;

  @ApiProperty({
    description: 'ID de l\'utilisateur (optionnel)',
    example: 1,
    required: false
  })
  @IsNumber()
  @IsOptional()
  userId?: number;
}

export class CreateCalculationDto {
  @ApiProperty({
    description: 'Expression mathématique',
    example: '2 + 3'
  })
  @IsString()
  expression!: string;

  @ApiProperty({
    description: 'Résultat du calcul',
    example: '5'
  })
  @IsString()
  result!: string;
}

export class CalculationResponseDto {
  @ApiProperty({
    description: 'Résultat du calcul',
    example: 15
  })
  result!: number;

  @ApiProperty({
    description: 'Opérateur utilisé',
    example: '+'
  })
  operator!: string;
}

export class CalculationDto {
  @ApiProperty({
    description: 'ID du calcul',
    example: 1
  })
  id!: number;

  @ApiProperty({
    description: 'Expression mathématique',
    example: '2 + 3'
  })
  expression!: string;

  @ApiProperty({
    description: 'Opérateur utilisé',
    example: '+'
  })
  operator!: string;

  @ApiProperty({
    description: 'Résultat du calcul',
    example: '5'
  })
  result!: string;

  @ApiProperty({
    description: 'Date de création',
    example: '2024-01-15T10:30:00.000Z'
  })
  createdAt!: Date;
}

export class CalculationHistoryResponseDto {
  @ApiProperty({
    description: 'Nombre total de calculs',
    example: 25
  })
  total!: number;

  @ApiProperty({
    description: 'Page actuelle',
    example: 1
  })
  page!: number;

  @ApiProperty({
    description: 'Taille de la page',
    example: 5
  })
  pageSize!: number;

  @ApiProperty({
    description: 'Historique des calculs',
    type: [CalculationDto]
  })
  history!: CalculationDto[];
}

export class OperatorCountDto {
  @ApiProperty({
    description: 'Opérateur mathématique',
    example: '+'
  })
  operator!: string;

  @ApiProperty({
    description: 'Nombre d\'occurrences de cet opérateur',
    example: 8
  })
  count!: number;
}

export class UserOperatorsResponseDto {
  @ApiProperty({
    description: 'ID de l\'utilisateur',
    example: 1
  })
  userId!: number;

  @ApiProperty({
    description: 'Nombre total de calculs de l\'utilisateur',
    example: 13
  })
  totalCalculations!: number;

  @ApiProperty({
    description: 'Liste des opérateurs avec leur nombre d\'occurrences',
    type: [OperatorCountDto]
  })
  operators!: OperatorCountDto[];
}
