import { Card } from "./UnoCard";
import { Socket } from "socket.io";
export declare class UnoPlayer {
    _name: string;
    _id: string;
    _isBot: boolean;
    _socket: Socket | null;
    constructor(_name: string, _id: string, _isBot: boolean, _socket: Socket | null);
    _hand: Card[];
}
