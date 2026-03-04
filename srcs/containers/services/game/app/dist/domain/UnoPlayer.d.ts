import { Card } from "./UnoCard";
import { Socket } from "socket.io";
export declare const generateNickname: () => string;
export declare class UnoPlayer {
    _id: string;
    _name: string;
    _socket: Socket | null;
    _isBot: boolean;
    _cardBack: string;
    hasShoutedUno: boolean;
    hasDrawThisTurn: boolean;
    constructor(_id: string, _name?: string, _socket?: Socket | null, _isBot?: boolean, _cardBack?: string);
    _hand: Card[];
}
