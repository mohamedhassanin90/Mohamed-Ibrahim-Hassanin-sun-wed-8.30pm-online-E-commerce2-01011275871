import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  InternalServerErrorException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { HUserDocument, User } from "src/DB/Models/user.model";
import type { Request } from "express";

export type AuthenticatedRequest = Request & { user: HUserDocument };

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<HUserDocument>,
    private jwtService: JwtService,
  ) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers.authorization;
    if (typeof authHeader !== "string") {
      throw new UnauthorizedException("Authorization header is required");
    }

    const [scheme, token, ...extra] = authHeader.split(" ");
    if (scheme !== "Bearer" || !token || extra.length) {
      throw new UnauthorizedException("Invalid authorization header");
    }

    const secret = process.env.TOKEN_ACCESS_ADMIN_SECRET;
    if (!secret) {
      throw new InternalServerErrorException(
        "Access token secret is not configured",
      );
    }

    let payload: { id?: string };
    try {
      payload = this.jwtService.verify<{ id?: string }>(token, { secret });
    } catch {
      throw new UnauthorizedException("Invalid or expired access token");
    }

    if (typeof payload.id !== "string") {
      throw new UnauthorizedException("Invalid access token payload");
    }

    const user = await this.userModel.findById(payload.id);
    if (!user) throw new UnauthorizedException("User not found");
    request.user = user;
    return true;
  }
}
