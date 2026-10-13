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
import { emailEvents } from "src/common/utils/events/email.events";
import { compare } from "src/common/utils/hashing/hash";
import { genereteOTP } from "src/common/utils/otp.util";
import { HOtpDocument, Otp } from "src/DB/Models/otp.model";
import { HUserDocument, User } from "src/DB/Models/user.model";

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
  async signup(body: any) {
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

    return { message: "User registerd successfully", user };
  }
  async resendOtp(resendOtp: any) {
    const { email } = resendOtp;
    const checkUser = await this.userModel
      .findOne({
        email,
        confirmEmail: { $exists: false },
      })
      .populate([{ path: "otp", match: { type: OtpEnum.EMAIL_VERIFICATION } }]);
    if (!checkUser) throw new ConflictException("User Not Found");
    if (checkUser.otp?.length)
      throw new ConflictException("Otp Already Exists");

    await this.createOtp(checkUser._id);

    return { message: "Otp Sent Successfully" };
  }
  async confirmEmail(confirmEmail: any) {
    const { email, otp } = confirmEmail;

    const user = await this.userModel
      .findOne({
        email,
        confirmEmail: { $exists: false },
      })
      .populate([{ path: "otp", match: { type: OtpEnum.EMAIL_VERIFICATION } }]);

    if (!user) throw new NotFoundException("user not found");

    if (!user.otp?.length) throw new NotFoundException("otp not found");

    if (!(await compare(otp, user.otp[0].code)))
      throw new BadRequestException("otp not valid");

    await this.userModel.updateOne(
      { _id: user._id },
      { $set: { confirmEmail: new Date() }, $inc: { __v: 1 } },
    );
    return { message: "User Confirmed Successfully" };
  }
  async login(login: any) {
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

    console.log('JWT secret:', process.env.TOKEN_ACCESS_ADMIN_SECRET);
  console.log('JWT expire:', process.env.ACCESS_TOKEN_EXPIRE_IN);


    const accessToken = await this.jwtService.sign(
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
    const refreshToken = await this.jwtService.sign(
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
  getProfile(req: any) {
    return { message: "profile fetched successfully", data: req.user };
  }
  async uploadfiles(files: Array<Express.Multer.File[]>) {
    return { message: "file uploaded successfully", data: files };
  }
}
