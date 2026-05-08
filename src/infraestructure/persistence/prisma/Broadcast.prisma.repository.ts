import { Broadcast } from '../../../domain/entities/Broadcast';
import { BroadcastRepository } from '../../../domain/repositories/Broadcast.repository';
import { FindOptions, FindRepository } from '../../../domain/schemas/find.schemas';

export class BroadcastPrismaRepository implements BroadcastRepository {
    create(entity: Broadcast): Promise<Broadcast | null> {
        throw new Error('Method not implemented.');
    }

    findById(id: number): Promise<Broadcast | null> {
        throw new Error('Method not implemented.');
    }

    find(findOptions: FindOptions): Promise<FindRepository<Broadcast>> {
        throw new Error('Method not implemented.');
    }

    update(id: number, entity: Broadcast): Promise<Broadcast | null> {
        throw new Error('Method not implemented.');
    }

    delete(id: number): Promise<boolean> {
        throw new Error('Method not implemented.');
    }

    findByAnimeId(animeId: number): Promise<Broadcast | null> {
        throw new Error('Method not implemented.');
    }

    findByDay(dayOfWeek: Date): Promise<Broadcast[]> {
        throw new Error('Method not implemented.');
    }
}
