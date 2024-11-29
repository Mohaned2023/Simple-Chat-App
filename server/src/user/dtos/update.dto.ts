import { PartialType } from "@nestjs/mapped-types";
import { CreateUserDto } from "./create.dto";

export class UpdateUserDto extends PartialType(CreateUserDto) {}