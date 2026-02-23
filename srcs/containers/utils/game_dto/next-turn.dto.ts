import { IsIn, IsNumber, Min } from "class-validator";

export interface INextTurn {
	currentPlayerIndex: number;
	turnDirection: "CLOCKWISE" | "COUNTER-CLOCKWISE";
}

export class NextTurnDto implements INextTurn {
	@IsNumber()
	@Min(0)
	currentPlayerIndex: number;

	@IsIn(["CLOCKWISE", "COUNTER-CLOCKWISE"])
	turnDirection: "CLOCKWISE" | "COUNTER-CLOCKWISE";
}
