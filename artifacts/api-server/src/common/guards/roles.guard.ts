import {
  Injectable,
  CanActivate,
  ExecutionContext,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";
import type { Request } from "express";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const enforce = process.env["SUPABASE_AUTH_ENFORCE"] === "true";
    if (!enforce) return true;

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest<Request>();
    const user = (req as unknown as Record<string, unknown>)["user"] as
      | { role?: string }
      | undefined;

    if (!user) return false;
    return requiredRoles.includes(user.role ?? "");
  }
}
