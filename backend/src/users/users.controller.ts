import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Post,
  Res,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import { LoggedUser } from 'src/auth/logged-user.decorator';
import { User } from 'src/schemas/user.schema';
import { HttpStatusCode } from 'src/utils/http-status-code';
import { GetProfileResponse } from './users.controller.types';
import { UsersService } from './users.service';
import { Response } from 'express';
import { GenericResponse } from 'src/generic-response.interceptor';
import { EditUserDto } from './dto/edit-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { SkipJWTAuth } from 'src/auth/jwt/skip-jwt-auth.annotation';
import { MongoSession } from 'src/mongo-session.decorator';
import { ClientSession } from 'mongoose';
import { CurrentDevice } from './current-device.decorator';
import { UserDevice } from '../schemas/user-device.schema';
import { IsTwoFactorAuthorized } from '../auth/is-two-factor-authorized';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @SkipJWTAuth()
  @HttpCode(HttpStatusCode.CREATED)
  @ApiOperation({
    summary: 'Create a new user',
    description: 'Create a new user',
  })
  @ApiCreatedResponse({ description: 'Success', type: GenericResponse })
  @ApiConflictResponse({
    description: 'Another user with the same email already exists',
    type: GenericResponse,
  })
  async createProfile(
    @MongoSession() mongoSession: ClientSession,
    @CurrentDevice() currentDevice: UserDevice,
    @Body() createUserDto: CreateUserDto,
  ) {
    await this.usersService.createUser(
      mongoSession,
      currentDevice,
      createUserDto,
    );
    return { msg: 'Success' };
  }

  @Get('profile')
  @ApiBearerAuth()
  @HttpCode(HttpStatusCode.OK)
  @ApiOperation({
    summary: 'Get current user',
    description: 'Get current user',
  })
  @ApiOkResponse({ description: 'Success', type: GetProfileResponse })
  async getProfile(
    @LoggedUser() user: User,
    @IsTwoFactorAuthorized() twoFactorAuthorized: boolean,
  ) {
    return {
      msg: 'Success',
      user: await this.usersService.prepareUserForOutput(
        user,
        twoFactorAuthorized,
      ),
    };
  }

  @Post('profile')
  @ApiBearerAuth()
  @HttpCode(HttpStatusCode.OK)
  @ApiOperation({
    summary: 'Edit current user',
    description: 'Edit current user',
  })
  @ApiOkResponse({ description: 'Success', type: GenericResponse })
  @ApiBadRequestResponse({
    description:
      'You have to specify both `email` and `password` if you want to change one of these properties',
    type: GenericResponse,
  })
  async setProfile(
    @MongoSession() mongoSession: ClientSession,
    @LoggedUser() user: User,
    @Body() editUserDto: EditUserDto,
  ) {
    if (
      user.email !== editUserDto.email &&
      (await this.usersService.findOneByEmail(editUserDto.email)) !== null
    ) {
      throw new ForbiddenException('This email is already used.');
    }
    await this.usersService.editProfile(mongoSession, user, editUserDto);

    return { msg: 'Success' };
  }

  @Delete('profile')
  @ApiBearerAuth()
  @HttpCode(HttpStatusCode.OK)
  @ApiOperation({
    summary: 'Delete current user',
    description: 'Delete current user',
  })
  @ApiOkResponse({ description: 'Success', type: GenericResponse })
  async deleteProfile(@LoggedUser() user: User) {
    await this.usersService.deleteUser(user);
    return { msg: 'Success' };
  }

  @Get('exportData')
  @ApiBearerAuth()
  @HttpCode(HttpStatusCode.OK)
  @ApiProduces('text/plain')
  @ApiOperation({
    summary: 'Export user data (without file content)',
    description: 'Export user data (without file content)',
  })
  @ApiOkResponse({ description: 'Done' })
  async exportData(@LoggedUser() user: User, @Res() res: Response) {
    const data = JSON.stringify(await this.usersService.exportData(user));
    res.set('Content-Type', 'text/plain');
    res.set(
      'Content-Disposition',
      `attachment; filename="${user.email}-personal-data.txt"`,
    );
    res.send(Buffer.from(data, 'utf-8'));
  }
}
