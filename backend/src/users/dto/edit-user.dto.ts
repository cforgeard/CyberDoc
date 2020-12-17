import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsLowercase,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { IsStrongPassword } from '../is-strong-password.decorator';

export class EditUserDto {
  @ApiProperty({ description: 'User first name', example: 'John' })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  firstname: string;

  @ApiProperty({ description: 'User last name', example: 'Doe' })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  lastname: string;

  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  @IsOptional()
  @IsNotEmpty()
  @IsEmail()
  @IsLowercase()
  email: string;

  @ApiProperty({ description: 'User password', example: 'eV66scN@t5tGG%ND' })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @IsStrongPassword()
  password: string;
}