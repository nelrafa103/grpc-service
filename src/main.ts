import { BaseExceptionFilter, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'node:path';
import { MicroserviceOptions } from '@nestjs/microservices';
import { Transport, ClientOptions } from '@nestjs/microservices';
import { ReflectionService } from '@grpc/reflection';
import { ServerCredentials } from '@grpc/grpc-js';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { HttpException, Logger } from '@nestjs/common';
import { RpcExceptionFilter } from './controllers/games.controller';

async function bootstrap() {
  console.log(__dirname);
  /*console.log(ServerCredentials.createSsl(
    Buffer.from(join(__dirname, '../ca.pem')),
    [],
    true
  )._isSecure()) */
  const grpcClientOptions: ClientOptions = {
    transport: Transport.GRPC,
    options: {
      credentials: ServerCredentials.createInsecure(),
      loader: {

      },
      url: '0.0.0.0:3000',
      package: 'games', // ['hero', 'hero2']
      protoPath: join(__dirname, '../proto/games.proto'), // ['./hero/hero.proto', './hero/hero2.proto']
      onLoadPackageDefinition: (pkg, server) => {
        new ReflectionService(pkg).addToServer(server);
      },
    },
  };

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  app.connectMicroservice<MicroserviceOptions>(grpcClientOptions);
  app.startAllMicroservices();
  app.useGlobalFilters(new RpcExceptionFilter())
  app.useGlobalFilters(new BaseExceptionFilter()) 
  // app.useLogger(false)
  //const app = await NestFactory.create(AppModule);
  
  await app.listen(3001, '0.0.0.0');
}
bootstrap();
