import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { AuthService } from "./auth.service";

import { AuthGuard } from "src/common/guard/auth.guard";
import type { AuthenticatedRequest } from "src/common/guard/auth.guard";
import { LoggingInterceptor } from "src/common/interceptors/logger.interceptor";
import { ResponseInterceptor } from "src/common/interceptors/reponse.interceptor";
import { FilesInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "node:path";
import { ZodPipe } from "src/common/pipes/zod.pipe";
import {
  confirmEmailSchema,
  createUserSchema,
  loginSchema,
  resendOtpSchema,
} from "./dto/createUser.dto";
import type {
  ConfirmEmailInput,
  CreateUserInput,
  LoginInput,
  ResendOtpInput,
} from "./dto/createUser.dto";

@UseInterceptors(LoggingInterceptor, ResponseInterceptor)
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("/signup")
  signup(@Body(new ZodPipe(createUserSchema)) body: CreateUserInput) {
    return this.authService.signup(body);
  }

  @Post("/resend-otp")
  async resendOtp(
    @Body(new ZodPipe(resendOtpSchema)) resendOtp: ResendOtpInput,
  ) {
    return await this.authService.resendOtp(resendOtp);
  }

  @Patch("/confirm-email")
  async confirmEmail(
    @Body(new ZodPipe(confirmEmailSchema)) confirmEmail: ConfirmEmailInput,
  ) {
    return await this.authService.confirmEmail(confirmEmail);
  }
  @Post("/login")
  @HttpCode(HttpStatus.OK)
  async login(@Body(new ZodPipe(loginSchema)) login: LoginInput) {
    return await this.authService.login(login);
  }
  @Get("/get-profile")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  getProfile(@Req() req: AuthenticatedRequest) {
    return this.authService.getProfile(req);
  }

  @Post("/upload-file")
  @UseInterceptors(
    FilesInterceptor("files", 5, {
      storage: diskStorage({
        destination: "./src/uploads",
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, //5mb
      },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.startsWith("image/")) {
          return callback(
            new BadRequestException("Only images are allowed"),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  uploadfile(@UploadedFiles() files: Express.Multer.File[]) {
    return this.authService.uploadfiles(files);
  }
}
