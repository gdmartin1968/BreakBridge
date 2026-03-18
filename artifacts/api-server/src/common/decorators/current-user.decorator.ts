import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { Request } from "express";

export interface AuthUser {
  id: string;
  email: string;
  role?: string;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const req = ctx.switchToHttp().getRequest<Request>();
    return (req as unknown as Record<string, unknown>)["user"] as AuthUser;
  },
);
