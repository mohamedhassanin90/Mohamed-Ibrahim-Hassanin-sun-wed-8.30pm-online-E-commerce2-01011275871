import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from "@nestjs/common";
import { AuthService } from "./auth.service";

import { PasswordMatchPipe } from "src/common/pipes/password-match.pipe";
import { AuthGuard } from "src/common/guard/auth.guard";
import { LoggingInterceptor } from "src/common/interceptors/logger.interceptor";
import { ResponseInterceptor } from "src/common/interceptors/reponse.interceptor";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "node:path";

@UseInterceptors(LoggingInterceptor, ResponseInterceptor)
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("/signup")
  signup(@Body() body: any) {
    return this.authService.signup(body);
  }

  @Post("/resend-otp")
  async resendOtp(@Body() resendOtp: any) {
    return await this.authService.resendOtp(resendOtp);
  }

  @Patch("/confirm-email")
  async confirmEmail(@Body() confirmEmail: any) {
    return await this.authService.confirmEmail(confirmEmail);
  }
  @Post("/login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() login: any) {
    return await this.authService.login(login);
  }
  @Get("/get-profile")
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async getProfile(@Req() req: any) {
    return await this.authService.getProfile(req);
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
  async uploadfile(@UploadedFiles() files: Array<Express.Multer.File[]>) {
    return await this.authService.uploadfiles(files);
  }
}
