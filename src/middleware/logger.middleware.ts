import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { method, url } = req;
    console.log(`[${new Date().toISOString()}-${method}-${url}]`);
    next();
  }
}

export function logger(req:Request,res:Response,next:NextFunction){
    const{method,url}=req;
    console.log(`[${new Date().toISOString()}-${method}-${url}]`);
    next()

}

@Injectable()
export class PreAuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (!req.headers.authorization)
      throw new BadRequestException("missing authorization header");
    next();
  }
}
