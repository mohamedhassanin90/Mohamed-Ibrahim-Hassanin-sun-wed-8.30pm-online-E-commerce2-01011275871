import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  NotFoundException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Observable } from "rxjs";
import { HUserDocument, User } from "src/DB/Models/user.model";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<HUserDocument>,
    private jwtService: JwtService,
  ) {}
 async canActivate(
    context: ExecutionContext,
  ) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    const token = authHeader.split(" ")[1];
    if (!token) throw new UnauthorizedException("invalid token format");
    
    const payload =  this.jwtService.verify(token,{
        secret: process.env.TOKEN_ACCESS_ADMIN_SECRET
    })
    const user= await this.userModel.findById(payload.id)
    if(!user) throw new NotFoundException("user not found")
    request.user=user
    return true;
  }
}
