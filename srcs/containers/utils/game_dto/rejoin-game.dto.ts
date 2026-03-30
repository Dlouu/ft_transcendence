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

export interface IRejoinOpponent {
	index: number;
	name: string;
	handSize: number;
	cardBackUrl: string
	profilePictureUrl: string
}

export class RejoinOpponentDto implements IRejoinOpponent {
	@IsNumber()
	@Min(0)
	index: number;

	@IsString()
	name: string;

	@IsNumber()
	@Min(0)
	handSize: number;

	@IsString()
	cardBackUrl: string;

	@IsString()
	profilePictureUrl: string;
}

export interface IRejoinGame {
	playerIndex: number;
	playerHand: CardDto[];
	opponents: RejoinOpponentDto[];
	currentPlayerIndex: number;
	turnDirection: "CLOCKWISE" | "COUNTER-CLOCKWISE";
	currentDiscardCard: CardDto;
	playerCardBackUrl: string;
	playerProfilePictureUrl: string;
	cardTheme: "basic" | "uwu";
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
	@Type(() => RejoinOpponentDto)
	opponents: RejoinOpponentDto[];

	@IsNumber()
	@Min(0)
	currentPlayerIndex: number;

	@IsIn(["CLOCKWISE", "COUNTER-CLOCKWISE"])
	turnDirection: "CLOCKWISE" | "COUNTER-CLOCKWISE";

	@ValidateNested()
	@Type(() => CardDto)
	currentDiscardCard: CardDto;

	@IsString()
	playerCardBackUrl: string;

	@IsString()
	playerProfilePictureUrl: string;

	@IsIn(["basic", "uwu"])
	cardTheme: "basic" | "uwu";
}

export const toRejoinGameDto = (
	player: UnoPlayer,
	game: Game,
): RejoinGameDto | null => {
	const discardTopCard = game.discard.peek();
	if (!discardTopCard) {
		return null;
	}

	let localPlayerIndex = game.players.findIndex((currentPlayer) => currentPlayer._id === player._id);
	if (localPlayerIndex === -1) {
		localPlayerIndex = game.players.findIndex((currentPlayer) => currentPlayer._name === player._name);
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
			const opponentDto = new RejoinOpponentDto();
			opponentDto.index = index;
			opponentDto.name = otherPlayer._name;
			opponentDto.handSize = otherPlayer._hand.length;
			opponentDto.cardBackUrl = otherPlayer._cardBack;
			opponentDto.profilePictureUrl = otherPlayer._profilePicture;
			return opponentDto;
		});
	dto.currentPlayerIndex = game.currentPlayerIndex;
	dto.turnDirection = game.currentDirection;
	dto.playerCardBackUrl = player._cardBack;
	dto.playerProfilePictureUrl = player._profilePicture;

	const discardCardDto = new CardDto();
	discardCardDto.cardCode = discardTopCard.value;
	discardCardDto.cardFamily = discardTopCard.family;
	dto.currentDiscardCard = discardCardDto;
	dto.cardTheme = game.cardTheme;

	return dto;
};