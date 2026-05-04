import { MalService as MalApiService } from '../services/mal/mal.service';
import { MalService } from '../../services/anime/mal.service';
import { AnimePrismaRepository } from '../persistence/prisma/Anime.prisma.repository';
import { AnimeService } from '../../services/anime/anime.service';

const animeRepository = new AnimePrismaRepository();

export const malAuthService = new MalApiService();
export const malService = new MalService(malAuthService);
export const animeService = new AnimeService(
    animeRepository,
    malService
);
