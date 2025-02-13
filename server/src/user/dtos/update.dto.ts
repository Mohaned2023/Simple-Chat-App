import { PartialType } from "@nestjs/mapped-types";
import { CreateUserDto } from "./create.dto";

/**
 * this class use for user updating.
 * @exports PartialType form CreateUserDto.
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {}