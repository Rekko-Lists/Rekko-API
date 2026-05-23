import { Anime } from '../Anime';
import { AnimeDTO } from '../dtos/AnimeDTO';

const DEMOGRAPHIC_WHITELIST = [
    'Shounen',
    'Shoujo',
    'Seinen',
    'Josei',
    'Kids'
] as const;

export class AnimeMapper {
    /**
     * Derive a virtual `demographic` field from the anime genres.
     * Matches case-insensitively against the whitelist
     * (Shounen | Shoujo | Seinen | Josei | Kids) and returns the
     * canonical capitalized form, or null when no genre matches.
     */
    private static deriveDemographic(
        genres: string[]
    ): string | null {
        if (!genres || genres.length === 0) return null;

        for (const genre of genres) {
            const match = DEMOGRAPHIC_WHITELIST.find(
                (d) =>
                    d.toLowerCase() === genre.trim().toLowerCase()
            );
            if (match) return match;
        }

        return null;
    }

    static toDTO(anime: Anime): AnimeDTO {
        const genres = anime.getGenres();

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
            genres,
            studios: anime.getStudios(),
            duration: anime.getDuration(),
            premieredSeason: anime.getPremieredSeason(),
            premieredYear: anime.getPremieredYear(),
            rating: anime.getRating(),
            demographic: this.deriveDemographic(genres),
            broadcast: anime.getBroadcast()
        });
    }

    static toDTOs(animes: Anime[]): AnimeDTO[] {
        return animes.map((anime) => this.toDTO(anime));
    }
}
