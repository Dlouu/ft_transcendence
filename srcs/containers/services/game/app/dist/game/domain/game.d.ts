import { player } from "./player";
import { card, CardFamily } from "./card";
export declare enum GameState {
    WAITING_FOR_PLAYERS = 0,
    DEALING = 1,
    PLAYING = 2,
    AWAITING_COLOR_CHOICE = 3,
    GAME_OVER = 4
}
export declare class game {
    constructor(name: string, players: string[], playerNbr: number, botNbr: number);
    toJson(): {
        roomName: string;
        players: {};
        connectedPlayers: any;
        deck: {};
        discard: {};
        currentFamily: CardFamily;
        currentDirection: "CLOCKWISE" | "COUNTER-CLOCKWISE";
        currentPlayerIndex: number;
        createdAt: number;
        turnStartTime: number;
        state: GameState;
        lastActionTime: number;
        pendingUnoPlayerIndex: number | null;
        unoShouted: boolean;
    };
    roomName: string;
    players: player[];
    connectedPlayers: Set<string>;
    realPlayersNbr: number;
    deck: card[];
    discard: card[];
    currentFamily: CardFamily;
    currentDirection: "CLOCKWISE" | "COUNTER-CLOCKWISE";
    currentPlayerIndex: number;
    createdAt: number;
    turnStartTime: number;
    lastActionTime: number;
    pendingUnoPlayerIndex: number | null;
    unoShouted: boolean;
    hasDrawnThisTurn: boolean;
    state: GameState;
}
