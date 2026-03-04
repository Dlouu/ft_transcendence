import { UnoPlayer } from "./UnoPlayer";
import { CardFamily, GameState } from "./GameEnums";
import { DeckPile } from "./DeckPile";
export declare class Game {
    roomName: string;
    cardTheme: "basic" | "uwu";
    players: UnoPlayer[];
    connectedPlayers: Set<string>;
    expectedPlayers: string[];
    private realPlayersNbr;
    private botNbr;
    deck: DeckPile;
    discard: DeckPile;
    currentFamily: CardFamily;
    currentDirection: "CLOCKWISE" | "COUNTER-CLOCKWISE";
    currentPlayerIndex: number;
    createdAt: number;
    turnStartTime: number;
    lastActionTime: number;
    pendingUnoPlayerIndex: number | null;
    state: GameState;
    constructor(name: string, players: string[], playerNbr: number, botNbr: number, cardTheme: "basic" | "uwu");
    toJson(): {
        roomName: string;
        cardTheme: "uwu" | "basic";
        expectedPlayers: string[];
        players: {
            name: string;
            isBot: boolean;
            handSize: number;
        }[];
        connectedPlayers: string[];
        deck: import("./UnoCard").Card[];
        discard: import("./UnoCard").Card[];
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
