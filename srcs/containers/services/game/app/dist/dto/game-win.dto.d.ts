export interface IGameWinPlayer {
    name: string;
    id: string;
    isBot: boolean;
    cardsLeft: number;
}
export declare class GameWinPlayerDto implements IGameWinPlayer {
    name: string;
    id: string;
    isBot: boolean;
    cardsLeft: number;
}
export interface IGameWin {
    winner: string;
    players: GameWinPlayerDto[];
    gameDuration: number;
    turnNbr: number;
}
export declare class GameWinDto implements IGameWin {
    winner: string;
    players: GameWinPlayerDto[];
    gameDuration: number;
    turnNbr: number;
}
