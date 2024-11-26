import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const GetUser = createParamDecorator( (_, ctx: ExecutionContext ) => {
    return ctx.switchToHttp().getRequest().user;
});
