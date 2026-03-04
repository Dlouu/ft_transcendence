export interface INextTurn {
    currentPlayerIndex: number;
    turnDirection: "CLOCKWISE" | "COUNTER-CLOCKWISE";
}
export declare class NextTurnDto implements INextTurn {
    currentPlayerIndex: number;
    turnDirection: "CLOCKWISE" | "COUNTER-CLOCKWISE";
}
