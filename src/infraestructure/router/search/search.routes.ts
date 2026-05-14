import { Router } from 'express';
import { searchData } from '../../../controllers/search/search.controller';
const router = Router();

router.route('/').get(searchData);

export default router;

/**
 * vale ahora vamos a empezar, porque no se si hare algun search.service pero bueno por ahora dejemoslo con routes y controller

ahora vamos a hacer un flujo un poco loco pero bueno es lo que hay, el flujo de este endpoint POR PARTE DE ANIMES que por ahora sera el unico que haremos mas adelante ya añadire user y post, el flujo de animes es:

1. se hace un promise ALL, que segun tengo entendido son por ejemplo 2 peticiones asyncronas que si una tarda 1sec y la otra 2 sec el total de las peticiones no seran 3 sec osea que no se hace una y despues la otra si no que se ejecutan las 2 a la vez y cuando esten todas pues se sigue, bueno una vez explicado se haran 2 peticiones una con los datos de filtro etc a nuestra db y otra a MyAnimeList con las funciones que tengo en el service de mal.service
2. Se mezclaran los resultados y se hara un dedup, osea que se mezclaran los resultados de nuestra db y los da MAL ordenados por el criterio del mal_id, 
 */
