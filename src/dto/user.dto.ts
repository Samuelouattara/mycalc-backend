import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsNumber } from 'class-validator';

export class RegisterUserDto {
  @ApiProperty({
    description: 'Adresse email de l\'utilisateur',
    example: 'user@example.com'
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Mot de passe de l\'utilisateur',
    example: 'password123'
  })
  @IsString()
  password!: string;

  @ApiProperty({
    description: 'Nom de l\'utilisateur',
    example: 'John Doe'
  })
  @IsString()
  Nom!: string;

  @ApiProperty({
    description: 'Icône de l\'utilisateur (optionnel)',
    example: 1,
    required: false
  })
  @IsNumber()
  @IsOptional()
  icon?: number;
}

export class LoginUserDto {
  @ApiProperty({
    description: 'Adresse email de l\'utilisateur',
    example: 'user@example.com'
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Mot de passe de l\'utilisateur',
    example: 'password123'
  })
  @IsString()
  password!: string;
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'Message de confirmation',
    example: 'Connexion réussie'
  })
  message!: string;

  @ApiProperty({
    description: 'ID de l\'utilisateur',
    example: 1
  })
  userId!: number;

  @ApiProperty({
    description: 'Nom de l\'utilisateur',
    example: 'John Doe'
  })
  nom!: string;
}

export class UserDto {
  @ApiProperty({
    description: 'ID de l\'utilisateur',
    example: 1
  })
  id!: number;

  @ApiProperty({
    description: 'Adresse email de l\'utilisateur',
    example: 'user@example.com'
  })
  email!: string;

  @ApiProperty({
    description: 'Nom de l\'utilisateur',
    example: 'John Doe'
  })
  Nom!: string;

  @ApiProperty({
    description: 'Icône de l\'utilisateur',
    example: 1,
    required: false
  })
  icon?: number;

  @ApiProperty({
    description: 'Numéro de téléphone',
    example: '+33123456789',
    required: false
  })
  phone?: string;

  @ApiProperty({
    description: 'Département',
    example: 'IT',
    required: false
  })
  department?: string;

  @ApiProperty({
    description: 'Date d\'inscription',
    example: '2024-01-15',
    required: false
  })
  joinDate?: string;

  @ApiProperty({
    description: 'Dernière connexion',
    example: '2024-01-15T10:30:00.000Z',
    required: false
  })
  lastLogin?: Date;

  @ApiProperty({
    description: 'Nombre de calculs effectués',
    example: 25
  })
  calculationsCount!: number;
}

export class DeleteAllResponseDto {
  @ApiProperty({
    description: 'Message de confirmation',
    example: 'Tous les utilisateurs ont été supprimés.'
  })
  message!: string;
}
