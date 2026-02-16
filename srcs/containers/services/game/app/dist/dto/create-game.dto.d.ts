export interface ICreateGame {
    roomName: string;
    players: string[];
    botNbr: number;
    theme: "BASE" | "UWU";
}
export declare class CreateGameDto implements ICreateGame {
    roomName: string;
    players: string[];
    botNbr: number;
    theme: "BASE" | "UWU";
}
