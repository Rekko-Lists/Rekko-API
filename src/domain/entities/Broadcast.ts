export class Broadcast {
    private readonly broadcastId: number;
    private dayOfWeek: string;
    private startTime: string;

    private constructor(
        broadcastId: number,
        dayOfWeek: string,
        startTime: string
    ) {
        this.broadcastId = broadcastId;
        this.dayOfWeek = dayOfWeek;
        this.startTime = startTime;
    }

    public static fromPersistence(data: {
        broadcastId: number;
        dayOfWeek: string;
        startTime: string;
    }): Broadcast {
        return new Broadcast(
            data.broadcastId,
            data.dayOfWeek,
            data.startTime
        );
    }

    getBroadcastId(): number {
        return this.broadcastId;
    }

    getDayOfWeek(): string {
        return this.dayOfWeek;
    }

    getStartTime(): string {
        return this.startTime;
    }

    toString(): string {
        return `
            broadcastId=${this.broadcastId},
            dayOfWeek=${this.dayOfWeek},
            startTime=${this.startTime}
        `;
    }
}
