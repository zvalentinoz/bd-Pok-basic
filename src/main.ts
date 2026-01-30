import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

// fue modificado para el Render 
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true
      }
    })
  );

  // Variables de entorno (solo para debug)
  console.log('========== VARIABLES DE ENTORNO ==========');
  console.log('PORT:', process.env.PORT);
  console.log('MONGODB:', process.env.MONGODB?.substring(0, 50) + '...');
  console.log('=============================================');

  // Puerto dinámico para Render
  const port = process.env.PORT || 3000;
  
  // IMPORTANTE: Escuchar en 0.0.0.0 para Render
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 App corriendo en puerto ${port}`);
}
bootstrap();