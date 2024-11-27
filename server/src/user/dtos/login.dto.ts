import { PickType } from "@nestjs/mapped-types";
import { CreateUserDto } from "./create.dto";


export class LoginDto extends PickType(CreateUserDto, ['username', 'password']) {}