import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Model } from "mongoose";
import { HUserDocument } from "src/DB/Models/user.model";
import { AuthGuard } from "./auth.guard";

describe("AuthGuard", () => {
  const user = { _id: "user-id" } as HUserDocument;
  const request: { headers: Record<string, string>; user?: HUserDocument } = {
    headers: {},
  };
  const findUser = jest.fn();
  const verify = jest.fn();
  const userModel = {
    findById: findUser,
  } as unknown as Model<HUserDocument>;
  const jwtService = {
    verify,
  } as unknown as JwtService;
  const guard = new AuthGuard(userModel, jwtService);
  const context = {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;

  beforeEach(() => {
    request.headers = {};
    delete request.user;
    jest.clearAllMocks();
    process.env.TOKEN_ACCESS_ADMIN_SECRET = "test-secret";
  });

  it("rejects requests without a bearer token", async () => {
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(verify).not.toHaveBeenCalled();
  });

  it("rejects invalid tokens", async () => {
    request.headers.authorization = "Bearer invalid";
    verify.mockImplementation(() => {
      throw new Error("invalid token");
    });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it("loads the token owner onto the request", async () => {
    request.headers.authorization = "Bearer valid";
    verify.mockReturnValue({ id: "user-id" });
    findUser.mockResolvedValue(user);

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toBe(user);
  });
});
