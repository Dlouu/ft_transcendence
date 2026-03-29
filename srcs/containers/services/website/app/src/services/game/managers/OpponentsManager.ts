import { Container } from "pixi.js";
import { Hand } from "../domain/Hand";
import { Opponent } from "../domain/Opponent";
import { CardPool } from "../domain/CardPool";
import { AssetsManager } from "./AssetsManager";
import { UnoCard } from "../domain/UnoCard";
import { InitGameDto } from "../dto/init-game.dto";
import { HandRotation } from "../domain/GameEnums";
import { RejoinOpponentHandSizeDto } from "../dto/rejoin-game.dto";
import { GAME_CUSTOMIZATION } from "../config/gameCustomization";
import { OpponentNameDisplay } from "./OpponentNameDisplay";
import { TableViewport } from "../layout/TableViewport";

export class OpponentsManager extends Container {
	private _opponents: Map<number, Opponent> = new Map();
	private _nameDisplays: Map<number, OpponentNameDisplay> = new Map();
	private _cardPool: CardPool;
	private _assetsManager: AssetsManager;

	private _positions: Map<string, { rotation: HandRotation }> = new Map([
		["left", { rotation: HandRotation.Left }],
		["top", { rotation: HandRotation.Top }],
		["right", { rotation: HandRotation.Right }],
	]);

	constructor(cardPool: CardPool, assetsManager: AssetsManager) {
		super();
		this._cardPool = cardPool;
		this._assetsManager = assetsManager;
	}

	public initializeOpponents(initGameDto: InitGameDto): void {
		const totalPlayers = initGameDto.players.length;
		const myIndex = initGameDto.playerIndex;

		for (let i = 0; i < totalPlayers; i++) {
			if (i === myIndex) continue;

			const relativeIndex = (i - myIndex + totalPlayers) % totalPlayers;
			let positionKey = "";

			if (totalPlayers === 2) {
				positionKey = "top";
			} else if (totalPlayers === 3) {
				if (relativeIndex === 1) positionKey = "left";
				if (relativeIndex === 2) positionKey = "right";
			} else {
				if (relativeIndex === 1) positionKey = "left";
				if (relativeIndex === 2) positionKey = "top";
				if (relativeIndex === 3) positionKey = "right";
			}

			const player = initGameDto.players[i];
			this.createOpponent(
				i,
				player.name,
				positionKey,
				initGameDto.startCardNbr,
				player.cardBack,
				player.profilePicture,
			);
		}
	}

	private createOpponent(
		index: number,
		name: string,
		positionKey: string,
		cardCount: number,
		cardBackVariant: string,
		pictureUrl: string,
	): void {
		const config = this._positions.get(positionKey);
		if (!config) return;

		const hand = new Hand(
			GAME_CUSTOMIZATION.opponents.hand.areaPercent,
			GAME_CUSTOMIZATION.opponents.hand.overlapPercent,
			GAME_CUSTOMIZATION.opponents.hand.cardRatio,
			config.rotation,
			false,
			true,
		);

		this.addChild(hand);

		const cardBack = this._assetsManager.getCardBack(cardBackVariant);
		const opponent = new Opponent(name, index, hand, cardBack);

		opponent.initializeHand(cardCount, this._cardPool);

		this._opponents.set(index, opponent);
		(hand as any)._layoutPosition = positionKey;

		// Create and add opponent name display
		const nameDisplay = new OpponentNameDisplay(
			name,
			pictureUrl,
			positionKey as "top" | "left" | "right",
		);
		this.addChild(nameDisplay);
		this._nameDisplays.set(index, nameDisplay);
		(nameDisplay as any)._layoutPosition = positionKey;
	}

	public resize(width: number, height: number, viewport?: TableViewport): void {
		const tableWidth = viewport?.tableWidth ?? width;
		const tableHeight = viewport?.tableHeight ?? height;
		const offsetX = viewport?.offsetX ?? 0;
		const offsetY = viewport?.offsetY ?? 0;
		const centerX = offsetX + tableWidth / 2;
		const centerY = offsetY + tableHeight / 2;

		// Calculate centerArea bounds
		const centerAreaWidth =
			tableWidth * GAME_CUSTOMIZATION.centerArea.mainWidthRatio;
		const centerAreaHeight = centerAreaWidth * GAME_CUSTOMIZATION.centerArea.mainAspectRatio;
		const centerAreaLeft = centerX - centerAreaWidth / 2;
		const centerAreaRight = centerX + centerAreaWidth / 2;
		const centerAreaTop = centerY - centerAreaHeight / 2;

		this._opponents.forEach((opp) => {
			const hand = opp.hand;
			const posKey = (hand as any)._layoutPosition;

			if (posKey === "top") {
				hand.position.set(
					centerX,
					offsetY + tableHeight * GAME_CUSTOMIZATION.opponents.positions.topYRatio,
				);
			} else if (posKey === "left") {
				hand.position.set(
					offsetX + tableWidth * GAME_CUSTOMIZATION.opponents.positions.leftXRatio,
					centerY,
				);
			} else if (posKey === "right") {
				hand.position.set(
					offsetX + tableWidth * GAME_CUSTOMIZATION.opponents.positions.rightXRatio,
					centerY,
				);
			}

			hand.resize(width, height, viewport);
			hand.setVisible(true);
		});

		// Resize and position name displays (centered between center area and opponent hand)
		this._nameDisplays.forEach((nameDisplay) => {
			const posKey = (nameDisplay as any)._layoutPosition;
			nameDisplay.resize(width, height, viewport);

			if (posKey === "top") {
				const handY =
					offsetY +
					tableHeight * GAME_CUSTOMIZATION.opponents.positions.topYRatio;
				const bias = GAME_CUSTOMIZATION.opponents.names.topCenterBias;
				const nameY = centerAreaTop + (handY - centerAreaTop) * bias;
				nameDisplay.position.set(centerX, nameY);
			} else if (posKey === "left") {
				const handX =
					offsetX +
					tableWidth * GAME_CUSTOMIZATION.opponents.positions.leftXRatio;
				const bias = GAME_CUSTOMIZATION.opponents.names.sideCenterBias;
				const nameX = centerAreaLeft + (handX - centerAreaLeft) * bias;
				nameDisplay.position.set(nameX, centerY);
			} else if (posKey === "right") {
				const handX =
					offsetX +
					tableWidth * GAME_CUSTOMIZATION.opponents.positions.rightXRatio;
				const bias = GAME_CUSTOMIZATION.opponents.names.sideCenterBias;
				const nameX = centerAreaRight + (handX - centerAreaRight) * bias;
				nameDisplay.position.set(nameX, centerY);
			}
		});
	}

	public setActivePlayer(playerIndex: number): void {
		this._opponents.forEach((opp) => {
			opp.hand.setTurnActive(opp.index === playerIndex);
		});
	}

	public getOpponentHandCenter(playerIndex: number): { x: number; y: number } | null {
		const opponent = this._opponents.get(playerIndex);
		if (!opponent) {
			return null;
		}

		return {
			x: opponent.hand.position.x,
			y: opponent.hand.position.y,
		};
	}

	public removeOpponentCard(
		playerName: string,
		cardIndex: number,
	): UnoCard | null {
		for (const opponent of this._opponents.values()) {
			if (opponent.name !== playerName) {
				continue;
			}

			return opponent.hand.removeCardAt(cardIndex);
		}

		return null;
	}

	public addOpponentCard(playerName: string): void {
		for (const opponent of this._opponents.values()) {
			if (opponent.name !== playerName) {
				continue;
			}

			const card = this._cardPool.getCard();
			opponent.addCard(card);
			return;
		}
	}

	public ensureOpponentsForRejoin(
		opponents: RejoinOpponentHandSizeDto[],
	): void {
		if (this._opponents.size > 0) {
			return;
		}

		const totalOpponents = opponents.length;
		opponents.forEach((opponentState, index) => {
			const opponentIndex =
				typeof opponentState.index === "number" && opponentState.index >= 0
					? opponentState.index
					: index + 1;

			this.createOpponent(
				opponentIndex,
				opponentState.name,
				this.getPositionKeyByOrder(index, totalOpponents),
				0,
				GAME_CUSTOMIZATION.opponents.defaultRejoinCardBackVariant,
				(opponentState as any).picture,
			);
		});
	}

	public syncOpponentHandSizes(opponents: RejoinOpponentHandSizeDto[]): void {
		for (const opponentState of opponents) {
			const opponent = [...this._opponents.values()].find(
				(opp) => opp.name === opponentState.name,
			);
			if (!opponent) {
				continue;
			}

			const currentHandSize = opponent.hand.children.filter(
				(child) => child instanceof UnoCard,
			).length;
			const targetHandSize = Math.max(0, opponentState.handSize);

			if (currentHandSize < targetHandSize) {
				const missingCards = targetHandSize - currentHandSize;
				for (let i = 0; i < missingCards; i++) {
					const card = this._cardPool.getCard();
					opponent.addCard(card);
				}
				continue;
			}

			if (currentHandSize > targetHandSize) {
				const cardsToRemove = currentHandSize - targetHandSize;
				for (let i = 0; i < cardsToRemove; i++) {
					const cardToRemove = opponent.hand.removeCardAt(
						opponent.hand.children.filter((child) => child instanceof UnoCard)
							.length - 1,
					);
					if (cardToRemove) {
						this._cardPool.returnCard(cardToRemove);
					}
				}
			}
		}
	}

	private getPositionKeyByOrder(order: number, totalOpponents: number): string {
		if (totalOpponents <= 1) {
			return "top";
		}

		if (totalOpponents === 2) {
			return order === 0 ? "right" : "left";
		}

		if (order === 0) return "right";
		if (order === 1) return "top";
		return "left";
	}

	public updateOpponentInfo(playerIndex: number, name: string, cardBackVariant: string): void {
		const opponent = this._opponents.get(playerIndex);
		if (!opponent) {
			return;
		}

		opponent.name = name;
		const cardBack = this._assetsManager.getCardBack(cardBackVariant);
		opponent.setCardBack(cardBack);

		// Update name display
		const nameDisplay = this._nameDisplays.get(playerIndex);
		if (nameDisplay) {
			nameDisplay.updateName(name);
		}
	}

	public destroy(): void {
		this._opponents.forEach((opp) => {
			if (opp.hand.parent) {
				opp.hand.parent.removeChild(opp.hand);
			}

			const cards = [...opp.hand.children];
			cards.forEach((c) => {
				if (c instanceof UnoCard) {
					opp.hand.removeCard(c);
					this._cardPool.returnCard(c);
				}
			});

			opp.destroy();
		});
		this._opponents.clear();

		// Destroy name displays
		this._nameDisplays.forEach((nameDisplay) => {
			nameDisplay.destroy();
		});
		this._nameDisplays.clear();
	}
}
