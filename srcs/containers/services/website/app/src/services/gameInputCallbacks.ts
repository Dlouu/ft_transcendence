import { Socket } from "socket.io-client";
import { UnoCard } from "./game/domain/UnoCard";
import { CardDto } from "./game/dto/card.dto";

export function handlePlayerCardClicked(
	card: UnoCard,
	socket: Socket | null,
): void {
	if (!card.card) {
		console.warn("GameService: clicked card has no metadata", card);
		return;
	}

	if (!socket) {
		console.warn("GameService: socket unavailable, cannot play card");
		return;
	}

	const payload: CardDto = {
		cardCode: card.card.value,
		cardFamily: card.card.family,
	};

	socket.emit("game:play:card", payload);

	console.log("GameService: player clicked card", {
		family: payload.cardFamily,
		value: payload.cardCode,
	});
}

export function handleDeckClicked(socket: Socket | null): void {
	if (!socket) {
		console.warn("GameService: socket unavailable, cannot play card");
		return;
	}

	socket.emit("game:play:draw");

	console.log("GameService: player clicked deck");
}

export function handleUnoClicked(socket: Socket | null): void {
	if (!socket) {
		console.warn("GameService: socket unavailable, cannot play UNO");
		return;
	}

	socket.emit("game:play:uno");

	console.log("GameService: player clicked UNO");
}
