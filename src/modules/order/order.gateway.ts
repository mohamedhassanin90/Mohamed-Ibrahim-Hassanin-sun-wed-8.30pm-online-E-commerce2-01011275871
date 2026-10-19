import {
  OnGatewayConnection,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { JwtService } from "@nestjs/jwt";
import { DefaultEventsMap, Namespace, Socket } from "socket.io";

type AuthenticatedSocketData = { userId: string };
type AuthenticatedSocket = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  AuthenticatedSocketData
>;
type OrderNamespace = Namespace<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  AuthenticatedSocketData
>;

type OrderEvent = {
  id: string;
  status: string;
  total: number;
};

@WebSocketGateway({
  namespace: "/orders",
  cors: {
    origin: (origin, callback) => {
      callback(null, !origin || origin === process.env.CLIENT_URL);
    },
  },
})
export class OrderGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer()
  private namespace: OrderNamespace;

  constructor(private readonly jwtService: JwtService) {}

  afterInit(namespace: OrderNamespace) {
    namespace.use((client, next) => {
      const authToken: unknown = client.handshake.auth?.token;
      const authorization = client.handshake.headers.authorization;
      const bearerToken =
        typeof authorization === "string" && authorization.startsWith("Bearer ")
          ? authorization.slice(7)
          : undefined;
      const token = typeof authToken === "string" ? authToken : bearerToken;

      if (!token) {
        next(new Error("Unauthorized"));
        return;
      }

      try {
        const payload = this.jwtService.verify<{ id: string }>(token, {
          secret: process.env.TOKEN_ACCESS_ADMIN_SECRET,
        });
        if (typeof payload.id !== "string") {
          next(new Error("Unauthorized"));
          return;
        }

        client.data.userId = payload.id;
        next();
      } catch {
        next(new Error("Unauthorized"));
      }
    });
  }

  handleConnection(client: AuthenticatedSocket) {
    void client.join(this.userRoom(client.data.userId));
  }

  emitOrderCreated(userId: string, order: OrderEvent) {
    this.namespace.to(this.userRoom(userId)).emit("order.created", order);
  }

  emitOrderUpdated(userId: string, order: OrderEvent) {
    this.namespace.to(this.userRoom(userId)).emit("order.updated", order);
  }

  private userRoom(userId: string) {
    return `user:${userId}`;
  }
}
