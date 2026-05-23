import { Anime } from '../Anime';
import { AnimeDTO, AnimeUserState } from '../dtos/AnimeDTO';

export class AnimeMapper {
    static toDTO(
        anime: Anime,
        userState?: AnimeUserState
    ): AnimeDTO {
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
            broadcast: anime.getBroadcast(),
            userState
        });
    }

    static toDTOs(
        animes: Anime[],
        statesByAnimeId?: Map<number, AnimeUserState>
    ): AnimeDTO[] {
        return animes.map((anime) =>
            this.toDTO(
                anime,
                statesByAnimeId?.get(anime.getAnimeId())
            )
        );
    }
}
