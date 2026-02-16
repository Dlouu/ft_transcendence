import { UnoPlayer } from "./UnoPlayer";
import { Card, CardFamily } from "./UnoCard";
export declare enum GameState {
    WAITING_FOR_PLAYERS = 0,
    DEALING = 1,
    PLAYING = 2,
    AWAITING_COLOR_CHOICE = 3,
    GAME_OVER = 4
}
export declare class Game {
    constructor(name: string, players: string[], playerNbr: number, botNbr: number);
    toJson(): {
        roomName: string;
        players: {
            name: string;
            isBot: boolean;
            handSize: number;
        }[];
        connectedPlayers: string[];
        deck: Card[];
        discard: Card[];
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
    players: UnoPlayer[];
    connectedPlayers: Set<string>;
    realPlayersNbr: number;
    deck: Card[];
    discard: Card[];
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
