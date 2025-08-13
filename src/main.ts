import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configuration de la validation globale
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Configuration de CORS
  app.enableCors();

  // Configuration de Swagger
  const config = new DocumentBuilder()
    .setTitle('MyCalc API')
    .setDescription('API de calculatrice avec gestion des utilisateurs et historique des calculs')
    .setVersion('1.0')
    .addTag('calculations', 'Endpoints pour les calculs mathématiques')
    .addTag('users', 'Endpoints pour la gestion des utilisateurs')
    .addTag('app', 'Endpoints généraux de l\'application')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  await app.listen(3007);
  console.log('Application démarrée sur http://localhost:3007');
  console.log('Documentation Swagger disponible sur http://localhost:3007/api');
}
bootstrap();
