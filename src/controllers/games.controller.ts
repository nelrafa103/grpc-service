import { Controller, Inject } from '@nestjs/common';
import { ClientProxy, GrpcMethod, GrpcStreamCall } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { request } from 'node:http';
//import { Response } from 'express';

interface Hero {
  id: number;
  name: string;
}

interface HeroById {
  limit: number;
  offset: number
}

type Root = {
  games: Games[]
}

interface Games {
  id: number
  cover: Cover
  name: string
  summary: string
  url: string
  websites: number[]
  genres?: Genre[]
}

interface Cover {
  id: number
  url: string
}

interface Genre {
  id: number
  name: string
}


interface Search {
  name: string
  limit: number
  offset: number
  genres: string[]
  platforms: string[]
  developers: string[]
}

interface byId {
  id: number
}
@Controller()
export class HeroesController {

  constructor(@Inject('GAMES_SERVICE') private client: ClientProxy) {}

  @GrpcMethod('GamesService', 'FindAll')
  async findAll(data: HeroById): Promise<Root> {
    const begin = Date.now()
    console.log("Por aqui")
    console.log(data.limit, data.offset)
    const response = await firstValueFrom(this.client.send({ cmd: 'all' }, { limit: data.limit, offset: data.offset }))
    console.log(response)
    const all: Root = {
      games: response
    }
    const end = Date.now()
    console.log(end - begin)
    return all
  }


  @GrpcMethod('GamesService', 'FindBy')
  async findBy(data: Search): Promise<Root> {
    //console.log(data)
    const all: Root = {
      games: await firstValueFrom(this.client.send({ cmd: 'search' }, { limit: 10, offset: 0, name: data.name, genres: data.genres, platforms: data.platforms, developers: data.developers }))
    }
    return all
  }

  @GrpcMethod('GamesService', 'FindById')
  async findById(data: byId): Promise<Root> {
    console.log(data)
    const all: Root = {
      games: await firstValueFrom(this.client.send({ cmd: 'byId' }, { id: data.id }))
    }
    console.log(all)
    return all
  }

  @GrpcStreamCall()
  lotsOfGreetings(requestStream: any, callback: (err: unknown, value: any) => void) {
    requestStream.on('data', message => {
      console.log(message);
    });
    requestStream.on('error', error => {
      console.log(error)
    })

    requestStream.on('end', final => {
      console.log('ok')
    })

    console.log()
    requestStream.on('end', () => callback(null, { reply: 'Hello, world!' }));
  }


}



@Catch(RpcException)
export class RpcExceptionFilter implements ExceptionFilter {
  catch(exception: RpcException, host: ArgumentsHost) {
    const error: any = exception.getError();
    const ctx = host.switchToHttp();
   // const response = ctx.getResponse<Response>();
    console.log(error)

   /* response
      .status(error.statusCode)
      .json(error);

  } */}
}
