import { Day } from '../../entities/Day';

export interface DayRepository {
    /**
     * Crear un nuevo Day con una fecha
     */
    create(date: string): Promise<Day | null>;

    /**
     * Obtener Day por su ID
     */
    findById(dayId: number): Promise<Day | null>;

    /**
     * Obtener Day por su fecha (YYYY-MM-DD)
     */
    findByDate(date: string): Promise<Day | null>;

    /**
     * Obtener o crear un Day con una fecha específica
     * Si existe, devuelve el existente; si no, lo crea
     */
    findOrCreate(date: string): Promise<Day>;

    /**
     * Borrar un Day por su ID
     */
    delete(dayId: number): Promise<boolean>;
}
