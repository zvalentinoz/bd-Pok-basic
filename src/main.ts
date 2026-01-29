import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {ValidationPipe} from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

 app.setGlobalPrefix('api/v1');

app.useGlobalPipes(
 new ValidationPipe({
 whitelist: true,
 forbidNonWhitelisted: true,
 transform: true,
 transformOptions:{
  enableImplicitConversion:true
 }
   })
  

);

  
  // AQUÍ SÍ SE VEN LAS VARIABLES DEL .ENV
  console.log('========== VARIABLES DE ENTORNO ==========');
  console.log('PORT:', process.env.PORT);
  console.log('MONGODB:', process.env.MONGODB);
  console.log('=============================================');


  // En main.ts, agrega esto temporal:
console.log('CWD:', process.cwd());
console.log('Archivo .env existe?:', require('fs').existsSync('.env'));
console.log('Contenido .env:', require('fs').readFileSync('.env', 'utf-8'));
  
  await app.listen(process.env.PORT || 3000);
  console.log(`App corriendo en puerto ${process.env.PORT || 3000}`);


}
bootstrap();
