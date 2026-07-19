import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FilmsService } from './films.service';
import { TmdbService } from './tmdb.service';
import { CreateFilmDto } from './dto/create-film.dto';
import { UpdateFilmDto } from './dto/update-film.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('films')
export class FilmsController {
  constructor(
    private readonly filmsService: FilmsService,
    private readonly tmdbService: TmdbService,
  ) {}

  @Get('tmdb/populaires')
  getFilmsPopulaires(@Query('page', new ParseIntPipe({ optional: true })) page?: number) {
    return this.tmdbService.getFilmsPopulaires(page);
  }

  @Get('tmdb/recherche')
  rechercher(@Query('query') query: string) {
    return this.tmdbService.rechercher(query);
  }

  @Get()
  findAll() {
    return this.filmsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.filmsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateFilmDto) {
    return this.filmsService.create(dto);
  }

  @Post('import/:tmdbId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  importerDepuisTmdb(@Param('tmdbId', ParseIntPipe) tmdbId: number) {
    return this.filmsService.importerDepuisTmdb(tmdbId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateFilmDto) {
    return this.filmsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.filmsService.remove(id);
  }
}
