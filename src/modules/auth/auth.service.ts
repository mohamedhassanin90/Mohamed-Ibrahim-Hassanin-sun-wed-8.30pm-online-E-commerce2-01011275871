import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { randomUUID } from "crypto";
import { Model, Types } from "mongoose";
import { OtpEnum, ProviderEnum } from "src/common/enums/user.enum";
import { compare } from "src/common/utils/hashing/hash";
import { genereteOTP } from "src/common/utils/otp.util";
import { HOtpDocument, Otp } from "src/DB/Models/otp.model";
import { HUserDocument, User } from "src/DB/Models/user.model";
import type {
  ConfirmEmailInput,
  CreateUserInput,
  LoginInput,
  ResendOtpInput,
} from "./dto/createUser.dto";
import type { AuthenticatedRequest } from "src/common/guard/auth.guard";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<HUserDocument>,
    @InjectModel(Otp.name) private readonly otpModel: Model<HOtpDocument>,
    private jwtService: JwtService,
  ) {}

  async createOtp(userId: Types.ObjectId) {
    await this.otpModel.create([
      {
        createdBy: userId,
        code: genereteOTP(),
        expiredAt: new Date(Date.now() + 2 * 60 * 1000),
        type: OtpEnum.EMAIL_VERIFICATION,
      },
    ]);
  }
  async signup(body: CreateUserInput) {
    const { email, firstName, lastName, password } = body;
    const checkUser = await this.userModel.findOne({ email });
    if (checkUser) throw new ConflictException("User Already Exists");

    const user = await this.userModel.create({
      email,
      firstName,
      lastName,
      password,
    });

    await this.createOtp(user._id);

    return {
      message: "User registered successfully",
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }
  async resendOtp(resendOtp: ResendOtpInput) {
    const { email } = resendOtp;
    const checkUser = await this.userModel
      .findOne({
        email,
        confirmEmail: { $exists: false },
      })
      .populate([{ path: "otp", match: { type: OtpEnum.EMAIL_VERIFICATION } }]);
    if (!checkUser) throw new ConflictException("User Not Found");
    const now = new Date();
    if (checkUser.otp?.some((otp) => otp.expiredAt > now))
      throw new ConflictException("Otp Already Exists");

    await this.otpModel.deleteMany({
      createdBy: checkUser._id,
      type: OtpEnum.EMAIL_VERIFICATION,
      expiredAt: { $lte: now },
    });
    await this.createOtp(checkUser._id);

    return { message: "Otp Sent Successfully" };
  }
  async confirmEmail(confirmEmail: ConfirmEmailInput) {
    const { email, otp } = confirmEmail;

    const user = await this.userModel
      .findOne({
        email,
        confirmEmail: { $exists: false },
      })
      .populate([{ path: "otp", match: { type: OtpEnum.EMAIL_VERIFICATION } }]);

    if (!user) throw new NotFoundException("user not found");

    if (!user.otp?.length) throw new NotFoundException("otp not found");
    if (user.otp[0].expiredAt <= new Date())
      throw new BadRequestException("otp expired");

    if (!(await compare(otp, user.otp[0].code)))
      throw new BadRequestException("otp not valid");

    await this.userModel.updateOne(
      { _id: user._id },
      { $set: { confirmEmail: new Date() }, $inc: { __v: 1 } },
    );
    return { message: "User Confirmed Successfully" };
  }
  async login(login: LoginInput) {
    const { email, password } = login;

    const user = await this.userModel.findOne({
      email,
      confirmEmail: { $exists: true },
      provider: ProviderEnum.SYSTEM,
    });

    if (!user) throw new NotFoundException("user not found");

    if (!(await compare(password, user.password)))
      throw new BadRequestException("invalid email or password");

    const jwtid = randomUUID();

    const accessToken = await this.jwtService.signAsync(
      {
        id: user._id,
        email: user.email,
      },
      {
        secret: process.env.TOKEN_ACCESS_ADMIN_SECRET,
        expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRE_IN),
        jwtid,
      },
    );
    const refreshToken = await this.jwtService.signAsync(
      {
        id: user._id,
        email: user.email,
      },
      {
        secret: process.env.TOKEN_REFRESH_ADMIN_SECRET,
        expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRE_IN),
        jwtid,
      },
    );
    return {
      message: "user loggedin successfully",
      credentials: { accessToken, refreshToken },
    };
  }
  getProfile(req: AuthenticatedRequest) {
    return { message: "profile fetched successfully", data: req.user };
  }
  uploadfiles(files: Express.Multer.File[]) {
    return { message: "file uploaded successfully", data: files };
  }
}
