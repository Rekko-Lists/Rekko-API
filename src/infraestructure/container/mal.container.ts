import { MalService as MalApiService } from '../services/mal/mal.service';
import { MalService } from '../../services/anime/mal.service';

export const malAuthService = new MalApiService();
export const malService = new MalService(malAuthService);
