import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  Post,
  Patch,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { UsersService } from 'src/users/users.service';
import { CreateOrUpdateTagDto } from './dto/create-or-update-tag.dto';
import { UsersTagsService } from './users-tags.service';
import { GenericResponse } from 'src/generic-response.interceptor';
import { HttpStatusCode } from 'src/utils/http-status-code';
import { MongoSession } from 'src/mongo-session.decorator';
import { ClientSession } from 'mongoose';

class UserTagResponse extends GenericResponse {
  @ApiProperty({
    description: 'Tag ID',
    example: 'f3f36d40-4785-198f-e4a6-2cef906c2aeb',
  })
  tagID: string;
}

@ApiTags('user-tags')
@ApiBearerAuth()
@Controller('user-tags')
export class UsersTagsController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersTagsService: UsersTagsService,
  ) {}

  @Post()
  @HttpCode(HttpStatusCode.CREATED)
  @ApiOperation({ summary: 'Create a tag', description: 'Create a tag' })
  @ApiCreatedResponse({ description: 'Tag created', type: UserTagResponse })
  async createTag(
    @MongoSession() mongoSession: ClientSession,
    @Req() req: Request,
    @Body() dto: CreateOrUpdateTagDto,
  ) {
    const user = await this.usersService.findOneByID((req.user as any).userID);
    const tag = await this.usersTagsService.createTag(
      mongoSession,
      user,
      dto.name,
      dto.color,
    );
    return { msg: 'Tag created', tagID: tag._id };
  }

  @Patch(':tagID')
  @HttpCode(HttpStatusCode.OK)
  @ApiParam({
    name: 'tagID',
    description: 'Tag ID',
    example: 'f3f36d40-4785-198f-e4a6-2cef906c2aeb',
  })
  @ApiOperation({ summary: 'Update a tag', description: 'Update a tag' })
  @ApiOkResponse({ description: 'Tag updated', type: UserTagResponse })
  @ApiNotFoundResponse({ description: 'Unknown tag', type: GenericResponse })
  async updateTag(
    @MongoSession() mongoSession: ClientSession,
    @Req() req: Request,
    @Param('tagID') tagID: string,
    @Body() dto: CreateOrUpdateTagDto,
  ) {
    const user = await this.usersService.findOneByID((req.user as any).userID);
    await this.usersTagsService.updateTag(
      mongoSession,
      user,
      tagID,
      dto.name,
      dto.color,
    );
    return { msg: 'Tag updated', tagID: tagID };
  }

  @Delete(':tagID')
  @HttpCode(HttpStatusCode.OK)
  @ApiParam({
    name: 'tagID',
    description: 'Tag ID',
    example: 'f3f36d40-4785-198f-e4a6-2cef906c2aeb',
  })
  @ApiOperation({ summary: 'Delete a tag', description: 'Delete a tag' })
  @ApiOkResponse({ description: 'Tag deleted', type: GenericResponse })
  @ApiNotFoundResponse({ description: 'Unknown tag', type: GenericResponse })
  async deleteTag(
    @MongoSession() mongoSession: ClientSession,
    @Req() req: Request,
    @Param('tagID') tagID: string,
  ) {
    const user = await this.usersService.findOneByID((req.user as any).userID);
    await this.usersTagsService.deleteTag(mongoSession, user, tagID);
    return { msg: 'Tag deleted' };
  }
}
