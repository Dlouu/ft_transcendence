import { card } from "./card";
import { Socket } from "socket.io";
export declare class player {
    _name: string;
    _isBot: boolean;
    _socket: Socket | null;
    constructor(_name: string, _isBot: boolean, _socket: Socket | null);
    _hand: card[];
}
