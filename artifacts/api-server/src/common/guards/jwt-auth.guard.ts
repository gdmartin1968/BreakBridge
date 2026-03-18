import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { createClient } from "@supabase/supabase-js";
import type { Request } from "express";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const enforce = process.env["SUPABASE_AUTH_ENFORCE"] === "true";

    if (!enforce) {
      // Dev passthrough — set a synthetic user on the request
      const req = context.switchToHttp().getRequest<Request>();
      (req as unknown as Record<string, unknown>)["user"] = {
        id: "dev-user-id",
        email: "dev@breakbridge.local",
        role: "platform_admin",
      };
      return true;
    }

    const req = context.switchToHttp().getRequest<Request>();
    const authHeader = req.headers["authorization"];
    const token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : null;

    if (!token) {
      throw new UnauthorizedException("Missing Bearer token");
    }

    const supabaseUrl = process.env["SUPABASE_URL"];
    const supabaseKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];
    if (!supabaseUrl || !supabaseKey) {
      throw new UnauthorizedException("Auth service not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      throw new UnauthorizedException("Invalid or expired token");
    }

    (req as unknown as Record<string, unknown>)["user"] = data.user;
    return true;
  }
}
