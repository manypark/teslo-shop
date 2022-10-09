import { applyDecorators, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { UserRolesGuard } from "../guards/user-roles.guard";
import { ValidRoles } from "../interfaces/valid-roles";
import { RoleProtected } from "./role-protected.decorator";

export function Auth( ...roles: ValidRoles[] ) {

    return applyDecorators(
        RoleProtected( ...roles ),
        UseGuards( AuthGuard(), UserRolesGuard ),
    );
}