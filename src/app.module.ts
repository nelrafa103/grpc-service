import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HeroesController } from './controllers/games.controller';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import * as fs from 'fs'

@Module({
  imports: [ConfigModule.forRoot({ envFilePath: '.env' })],
  controllers: [AppController, HeroesController],
  providers: [
    AppService,
    {
      provide: 'GAMES_SERVICE',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
          /*  tlsOptions: {

              cert: fs.readFileSync(join(__dirname, '../fullchain.pem')),
              key: fs.readFileSync(join(__dirname, '../key.pem'))
            },
 */
            host: 'rest-service',
            port: 3000,
          },
        });
      },
    },
    {
      provide: 'FIRESTORE_SERVICE',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return ClientProxyFactory.create({
          transport: Transport.TCP,
          options: {
            host: 'firestore-service',
            port: 3000,
          },
        });
      },
    }
  ],
})
export class AppModule {}
