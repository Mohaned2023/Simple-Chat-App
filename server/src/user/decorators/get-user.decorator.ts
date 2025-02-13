import { createParamDecorator, ExecutionContext } from "@nestjs/common";

/**
 * GetUser is a decorator use to get the user from the request.
 */
export const GetUser = createParamDecorator( (_, ctx: ExecutionContext ) => {
    return ctx.switchToHttp().getRequest().user;
});
