import { SetMetadata } from "@nestjs/common";

export const ROLES_KEY = "roles";

// System roles from the master architecture contract
export enum SystemRole {
  PLATFORM_ADMIN = "platform_admin",
  ORG_ADMIN = "org_admin",
  LOCATION_ADMIN = "location_admin",
  SUPERVISOR = "supervisor",
  VIEWER = "viewer",
}

export const Roles = (...roles: SystemRole[]) =>
  SetMetadata(ROLES_KEY, roles);
