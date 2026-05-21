import { Anime } from '../Anime';
import { AnimeDTO } from '../dtos/AnimeDTO';

export class AnimeMapper {
    static toDTO(anime: Anime): AnimeDTO {
        return new AnimeDTO({
            malId: anime.getMalId(),
            name: anime.getName(),
            synopsis: anime.getSynopsis(),
            imgMedium: anime.getImgMedium(),
            imgLarge: anime.getImgLarge(),
            startDate: anime.getStartDate(),
            endDate: anime.getEndDate(),
            malMean: anime.getMalMean(),
            malRank: anime.getMalRank(),
            mean: anime.getMean(),
            numEpisodes: anime.getNumEpisodes(),
            status: anime.getStatus(),
            likes: anime.getLikes(),
            genres: anime.getGenres(),
            studios: anime.getStudios(),
            broadcast: anime.getBroadcast()
        });
    }

    static toDTOs(animes: Anime[]): AnimeDTO[] {
        return animes.map((anime) => this.toDTO(anime));
    }
}
