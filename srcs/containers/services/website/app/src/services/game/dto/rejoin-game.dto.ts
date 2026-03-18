import { Type } from "class-transformer";
import {
	ArrayMinSize,
	IsArray,
	IsIn,
	IsNumber,
	IsString,
	Min,
	ValidateNested,
} from "class-validator";
import { Game } from "../domain/UnoGame";
import { UnoPlayer } from "../domain/UnoPlayer";
import { CardDto } from "./card.dto";
import { toCardDtoArray } from "./init-game.dto";

export interface IRejoinOpponentHandSize {
	index: number;
	name: string;
	handSize: number;
}

export class RejoinOpponentHandSizeDto implements IRejoinOpponentHandSize {
	@IsNumber()
	@Min(0)
	index: number;

	@IsString()
	name: string;

	@IsNumber()
	@Min(0)
	handSize: number;
}

export interface IRejoinGame {
	playerIndex: number;
	playerHand: CardDto[];
	opponents: RejoinOpponentHandSizeDto[];
	currentPlayerIndex: number;
	turnDirection: "CLOCKWISE" | "COUNTER-CLOCKWISE";
	currentDiscardCard: CardDto;
}

export class RejoinGameDto implements IRejoinGame {
	@IsNumber()
	@Min(0)
	playerIndex: number;

	@IsArray()
	@ArrayMinSize(1)
	@ValidateNested({ each: true })
	@Type(() => CardDto)
	playerHand: CardDto[];

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => RejoinOpponentHandSizeDto)
	opponents: RejoinOpponentHandSizeDto[];

	@IsNumber()
	@Min(0)
	currentPlayerIndex: number;

	@IsIn(["CLOCKWISE", "COUNTER-CLOCKWISE"])
	turnDirection: "CLOCKWISE" | "COUNTER-CLOCKWISE";

	@ValidateNested()
	@Type(() => CardDto)
	currentDiscardCard: CardDto;
}

export const toRejoinGameDto = (
	player: UnoPlayer,
	game: Game,
): RejoinGameDto | null => {
	const discardTopCard = game.discard.peek();
	if (!discardTopCard) {
		return null;
	}

	let localPlayerIndex = game.players.findIndex(
		(currentPlayer) => currentPlayer._id === player._id,
	);
	if (localPlayerIndex === -1) {
		localPlayerIndex = game.players.findIndex(
			(currentPlayer) => currentPlayer._name === player._name,
		);
	}
	if (localPlayerIndex === -1) {
		return null;
	}

	const dto = new RejoinGameDto();
	dto.playerIndex = localPlayerIndex;
	dto.playerHand = toCardDtoArray(player._hand);
	dto.opponents = game.players
		.map((otherPlayer, index) => ({ otherPlayer, index }))
		.filter(({ index }) => index !== localPlayerIndex)
		.map(({ otherPlayer, index }) => {
			const opponentDto = new RejoinOpponentHandSizeDto();
			opponentDto.index = index;
			opponentDto.name = otherPlayer._name;
			opponentDto.handSize = otherPlayer._hand.length;
			return opponentDto;
		});
	dto.currentPlayerIndex = game.currentPlayerIndex;
	dto.turnDirection = game.currentDirection;

	const discardCardDto = new CardDto();
	discardCardDto.cardCode = discardTopCard.value;
	discardCardDto.cardFamily = discardTopCard.family;
	dto.currentDiscardCard = discardCardDto;

	return dto;
};
