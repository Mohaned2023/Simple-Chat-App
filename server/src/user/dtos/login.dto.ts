import { PickType } from "@nestjs/mapped-types";
import { CreateUserDto } from "./create.dto";

/**
 * this class use for user login.
 * @exports PickType form CreateUserDto [ username, password]
 */
export class LoginDto extends PickType(CreateUserDto, ['username', 'password']) {}