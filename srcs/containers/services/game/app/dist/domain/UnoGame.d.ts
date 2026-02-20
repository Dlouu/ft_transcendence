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
    roomName: string;
    players: UnoPlayer[];
    connectedPlayers: Set<string>;
    expectedPlayers: string[];
    private realPlayersNbr;
    private botNbr;
    deck: Card[];
    discard: Card[];
    currentFamily: CardFamily;
    currentDirection: "CLOCKWISE" | "COUNTER-CLOCKWISE";
    currentPlayerIndex: number;
    createdAt: number;
    turnStartTime: number;
    lastActionTime: number;
    pendingUnoPlayerIndex: number | null;
    state: GameState;
    constructor(name: string, players: string[], playerNbr: number, botNbr: number);
    toJson(): {
        roomName: string;
        expectedPlayers: string[];
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
    };
    addBots(): void;
    addPlayer(player: UnoPlayer): boolean;
    removePlayer(playerId: string): boolean;
}
