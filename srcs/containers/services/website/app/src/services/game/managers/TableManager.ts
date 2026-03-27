import { CardDto } from "../dto/card.dto";
import { Container, Sprite, Texture } from "pixi.js";
import { Hand } from "../domain/Hand";
import { CardPile } from "../domain/CardPile";
import { OpponentsManager } from "./OpponentsManager";
import { CardPool } from "../domain/CardPool";
import { AssetsManager } from "./AssetsManager";
import { Card, UnoCard } from "../domain/UnoCard";
import { InitGameDto } from "../dto/init-game.dto";
import { CardFamily, HandRotation } from "../domain/GameEnums";
import { CardFamilySelector, SelectableCardFamily } from "./CardFamilySelector";
import { TableCenterArea } from "./TableCenterArea";
import { GameWinDto, GameWinPlayerDto } from "../dto/game-win.dto";
import { VictoryScreen } from "./VictoryScreen";
import { RejoinGameDto } from "../dto/rejoin-game.dto";
import { GAME_CUSTOMIZATION } from "../config/gameCustomization";
import { UnoButton } from "./UnoButton";
import { TurnTimerBar } from "./TurnTimerBar";

export class TableManager extends Container {
	private static readonly MIDDLE_ARROW_Y_RATIO =
		GAME_CUSTOMIZATION.table.middleArrowYRatio;
	private static readonly MIDDLE_ARROW_SIZE_RATIO =
		GAME_CUSTOMIZATION.table.middleArrowSizeRatio;
	private static readonly UNO_BUTTON_Y_RATIO =
		GAME_CUSTOMIZATION.table.unoButtonYRatio;
	private static readonly UNO_BUTTON_WIDTH_RATIO =
		GAME_CUSTOMIZATION.table.unoButtonWidthRatio;
	private static readonly TURN_TIMER_DURATION_MS =
		GAME_CUSTOMIZATION.table.turnTimer.durationMs;

	private _playerIndex: number = -1;
	private _middleArrow: Sprite;
	private _unoButton: UnoButton;
	private _turnTimerBar: TurnTimerBar;
	private _tableWidth: number = 0;
	private _tableHeight: number = 0;
	private _isMiddleArrowMirrored: boolean = false;

	private _tableCenterArea: TableCenterArea;
	private _cardFamilySelector: CardFamilySelector | null = null;
	private _victoryScreen: VictoryScreen;

	private _playerHand: Hand;
	private _deck: CardPile;
	private _discard: CardPile;
	private _localPlayerName: string | null = null;

	private _cardPool: CardPool;
	private _assetsManager: AssetsManager;
	private _opponentsManager: OpponentsManager;

	constructor(
		cardPool: CardPool,
		assetsManager: AssetsManager,
		onPlayerCardClick?: (card: UnoCard) => void,
		onDeckClick?: () => void,
		onUnoButtonClick?: () => void,
	) {
		super();

		this._cardPool = cardPool;
		this._assetsManager = assetsManager;

		this._deck = new CardPile(null, true, true, onDeckClick);
		this._discard = new CardPile(null, true, false);
		this._tableCenterArea = new TableCenterArea();
		this._victoryScreen = new VictoryScreen();
		this._middleArrow = new Sprite(this._assetsManager.arrowTexture);
		this._middleArrow.anchor.set(0.5);
		this._unoButton = new UnoButton(onUnoButtonClick);
		this._turnTimerBar = new TurnTimerBar();

		this._playerHand = new Hand(
			GAME_CUSTOMIZATION.table.playerHand.areaPercent,
			GAME_CUSTOMIZATION.table.playerHand.overlapPercent,
			GAME_CUSTOMIZATION.table.playerHand.cardRatio,
			HandRotation.Bottom,
			true,
			false,
			false,
			onPlayerCardClick,
		);

		this._opponentsManager = new OpponentsManager(cardPool, assetsManager);

		this.addChild(this._opponentsManager);
		this.addChild(this._tableCenterArea);
		this.addChild(this._turnTimerBar);
		this.addChild(this._middleArrow);
		this.addChild(this._unoButton);
		this.addChild(this._deck);
		this.addChild(this._discard);
		this.addChild(this._playerHand);
		this.addChild(this._victoryScreen);
	}

	public initializeGame(initGameDto: InitGameDto): void {
		this._playerIndex = initGameDto.playerIndex;
		this._localPlayerName =
			initGameDto.players[initGameDto.playerIndex]?.name ?? null;

		this._tableCenterArea.setColors({
			...this._assetsManager.getThemeBackdropColors(),
		});

		this._opponentsManager.initializeOpponents(initGameDto);

		this.setupPlayerHand(initGameDto);

		this.setupPiles(initGameDto);

		this._playerHand.setVisible(true);
		this._deck.setVisible(true);
		this._discard.setVisible(true);
		this._tableCenterArea.visible = true;
		this.hideCardFamilySelector();
		this.setUnoButtonVisible(false);
		this._turnTimerBar.stop();
		this._victoryScreen.hide();

		this.setActivePlayer(initGameDto.firstPlayerIndex);
	}

	public showVictoryScreen(dto: GameWinDto, localPlayerId?: string): void {
		const localPlayer = this.resolveLocalPlayer(dto.players, localPlayerId);
		const isVictory = localPlayer
			? dto.winner === localPlayer.id || dto.winner === localPlayer.name
			: false;

		this.hideCardFamilySelector();
		this.setUnoButtonVisible(false);
		this._turnTimerBar.stop();
		this._playerHand.setTurnActive(false);
		this._opponentsManager.setActivePlayer(-1);

		this._victoryScreen.show(dto, isVictory);
		this._victoryScreen.resize(this._tableWidth, this._tableHeight);
	}

	public showCardFamilySelector(
		onSelect: (cardFamily: SelectableCardFamily) => void,
	): void {
		this.hideCardFamilySelector();

		this._cardFamilySelector = new CardFamilySelector(
			{
				[CardFamily.ONE]: this._tableCenterArea.getColorForFamily(
					CardFamily.ONE,
				),
				[CardFamily.TWO]: this._tableCenterArea.getColorForFamily(
					CardFamily.TWO,
				),
				[CardFamily.THREE]: this._tableCenterArea.getColorForFamily(
					CardFamily.THREE,
				),
				[CardFamily.FOUR]: this._tableCenterArea.getColorForFamily(
					CardFamily.FOUR,
				),
			},
			Math.min(this._tableWidth, this._tableHeight) *
				GAME_CUSTOMIZATION.table.cardFamilySelectorRadiusRatio,
			(cardFamily) => {
				onSelect(cardFamily);
				this.hideCardFamilySelector();
			},
		);

		this._cardFamilySelector.position.set(
			this._tableWidth / 2,
			this._tableHeight / 2,
		);
		this.addChild(this._cardFamilySelector);
	}

	public hideCardFamilySelector(): void {
		if (!this._cardFamilySelector) {
			return;
		}

		this._cardFamilySelector.destroy({ children: true });
		this._cardFamilySelector = null;
	}

	public setActivePlayer(playerIndex: number): void {
		const isLocalPlayerTurn = playerIndex === this._playerIndex;
		this._playerHand.setTurnActive(isLocalPlayerTurn);
		this._opponentsManager.setActivePlayer(playerIndex);

		if (playerIndex >= 0) {
			this._turnTimerBar.start(TableManager.TURN_TIMER_DURATION_MS);
		} else {
			this._turnTimerBar.stop();
		}
	}

	public removePlayerCard(cardIndex: number, cardDto?: CardDto): void {
		const removedCard = cardDto
			? (this._playerHand.removeFirstMatchingCard(
					cardDto.cardFamily,
					cardDto.cardCode,
				) ?? this._playerHand.removeCardAt(cardIndex))
			: this._playerHand.removeCardAt(cardIndex);

		if (!removedCard) {
			return;
		}

		this._cardPool.returnCard(removedCard);
	}

	public addPlayerCard(cardDto: CardDto | undefined): void {
		if (!cardDto) return;

		const card = this._cardPool.getCard();
		const cardModel = new Card(cardDto.cardFamily, cardDto.cardCode);
		const texture = this._assetsManager.getCardTexture(
			cardDto.cardFamily,
			cardDto.cardCode,
		);

		card.setFaceUpCard(texture, cardModel);
		this._playerHand.addCard(card);
		this._playerHand.sortCards();
	}

	public removeOpponentCard(playerName: string, cardIndex: number): void {
		const removedCard = this._opponentsManager.removeOpponentCard(
			playerName,
			cardIndex,
		);
		if (!removedCard) {
			return;
		}

		this._cardPool.returnCard(removedCard);
	}

	public addOpponentCard(playerName: string): void {
		this._opponentsManager.addOpponentCard(playerName);
	}

	public updateOpponentInfo(playerIndex: number, name: string, cardBackVariant: string): void {
		this._opponentsManager.updateOpponentInfo(playerIndex, name, cardBackVariant);
	}

	public setDeckVisible(isVisible: boolean): void {
		this._deck.setVisible(isVisible);
	}

	public setUnoButtonVisible(isVisible: boolean): void {
		this._unoButton.setVisible(isVisible);
	}

	public setUnoButtonText(text: string): void {
		this._unoButton.setText(text);
	}

	public updateDiscardCard(cardDto: CardDto): void {
		const oldCard = this._discard.card;
		if (oldCard) {
			this._discard.setCard(null);
			this._cardPool.returnCard(oldCard);
		}

		const newDiscardCard = this._cardPool.getCard();
		const discardCardModel = new Card(cardDto.cardFamily, cardDto.cardCode);
		const texture = this._assetsManager.getCardTexture(
			cardDto.cardFamily,
			cardDto.cardCode,
		);
		newDiscardCard.setFaceUpCard(texture, discardCardModel);
		this._discard.setCard(newDiscardCard);

		this.setPilesBackdropColorByCardSet(cardDto.cardFamily);
	}

	public resize(width: number, height: number): void {
		this._tableWidth = width;
		this._tableHeight = height;

		this.updateMiddleArrow(width, height);

		this._playerHand.position.set(
			width / 2,
			height * GAME_CUSTOMIZATION.table.playerHandYRatio,
		);
		this._playerHand.resize(width, height);

		this._opponentsManager.resize(width, height);

		this._tableCenterArea.update(width, height);

		const pilesOffset = width / GAME_CUSTOMIZATION.table.pilesOffsetDivisor;

		this._deck.position.set(width / 2 - pilesOffset, height / 2);
		this._deck.resize(width, height);

		this._discard.position.set(width / 2 + pilesOffset, height / 2);
		this._discard.resize(width, height);

		this._unoButton.resize(
			width,
			height,
			TableManager.UNO_BUTTON_Y_RATIO,
			TableManager.UNO_BUTTON_WIDTH_RATIO,
		);

		this._turnTimerBar.resize(width, height);

		if (this._cardFamilySelector) {
			this._cardFamilySelector.position.set(width / 2, height / 2);
		}

		this._victoryScreen.resize(width, height);
	}

	private updateMiddleArrow(width: number, height: number): void {
		if (this._middleArrow.texture === Texture.EMPTY) {
			this._middleArrow.texture = this._assetsManager.arrowTexture;
		}

		const size = Math.min(width, height) * TableManager.MIDDLE_ARROW_SIZE_RATIO;

		this._middleArrow.position.set(width / 2, height * TableManager.MIDDLE_ARROW_Y_RATIO);
		this._middleArrow.width = size;
		this._middleArrow.height = size;
		this._middleArrow.scale.x =
			Math.abs(this._middleArrow.scale.x) *
			(this._isMiddleArrowMirrored ? -1 : 1);
	}

	public mirrorMiddleArrow(): void {
		this._isMiddleArrowMirrored = !this._isMiddleArrowMirrored;
		this._middleArrow.scale.x =
			Math.abs(this._middleArrow.scale.x) *
			(this._isMiddleArrowMirrored ? -1 : 1);
	}

	public setTurnDirection(
		turnDirection: "CLOCKWISE" | "COUNTER-CLOCKWISE",
	): void {
		this._isMiddleArrowMirrored = turnDirection === "COUNTER-CLOCKWISE";
		this._middleArrow.scale.x =
			Math.abs(this._middleArrow.scale.x) *
			(this._isMiddleArrowMirrored ? -1 : 1);
	}

	public applyRejoinState(dto: RejoinGameDto): void {
		this._playerIndex = this.resolveRejoinPlayerIndex(dto);

		this._tableCenterArea.setColors({
			...this._assetsManager.getThemeBackdropColors(),
		});

		this.ensureDeckCardForRejoin();
		this._opponentsManager.ensureOpponentsForRejoin(dto.opponents);
		this.resetPlayerHand(dto);
		this._opponentsManager.syncOpponentHandSizes(dto.opponents);
		this.updateDiscardCard(dto.currentDiscardCard);
		this.setTurnDirection(dto.turnDirection);

		if (this._tableWidth > 0 && this._tableHeight > 0) {
			this._opponentsManager.resize(this._tableWidth, this._tableHeight);
		}

		this._playerHand.setVisible(true);
		this._deck.setVisible(true);
		this._discard.setVisible(true);
		this.hideCardFamilySelector();
		this.setUnoButtonVisible(false);
		this._turnTimerBar.stop();
		this._victoryScreen.hide();

		this.setActivePlayer(dto.currentPlayerIndex);
	}

	private resolveRejoinPlayerIndex(dto: RejoinGameDto): number {
		if (typeof dto.playerIndex === "number" && dto.playerIndex >= 0) {
			return dto.playerIndex;
		}

		const usedIndexes = new Set<number>();
		dto.opponents.forEach((opponent) => {
			if (typeof opponent.index === "number" && opponent.index >= 0) {
				usedIndexes.add(opponent.index);
			}
		});

		let inferredIndex = 0;
		while (usedIndexes.has(inferredIndex)) {
			inferredIndex += 1;
		}

		return inferredIndex;
	}

	private ensureDeckCardForRejoin(): void {
		if (this._deck.card) {
			return;
		}

		const deckCard = this._cardPool.getCard();
		deckCard.setFaceBackCard(
			this._assetsManager.getCardBack(
				GAME_CUSTOMIZATION.table.defaultRejoinCardBackVariant,
			),
			null,
		);
		this._deck.setCard(deckCard);
	}

	public setPilesBackdropColorByCardSet(cardFamily: CardFamily): void {
		console.log(`New color : ${cardFamily}`);
		const color = this._tableCenterArea.getColorForFamily(cardFamily);
		this.setPilesBackdropColor(color);
	}

	public setPilesBackdropGrey(): void {
		this.setPilesBackdropColor(GAME_CUSTOMIZATION.table.pilesFallbackGrey);
	}

	private setupPlayerHand(dto: InitGameDto): void {
		for (const cardData of dto.playerHand) {
			const card = this._cardPool.getCard();
			const cardModel = new Card(cardData.cardFamily, cardData.cardCode);
			const texture = this._assetsManager.getCardTexture(
				cardData.cardFamily,
				cardData.cardCode,
			);

			card.setFaceUpCard(texture, cardModel);
			this._playerHand.addCard(card);
		}

		this._playerHand.sortCards();
	}

	private setupPiles(dto: InitGameDto): void {
		const deckCard = this._cardPool.getCard();
		deckCard.setFaceBackCard(
			this._assetsManager.getCardBack(dto.players[dto.playerIndex].cardBack),
			null,
		);
		this._deck.setCard(deckCard);

		const discardCard = this._cardPool.getCard();
		const discardCardModel = new Card(
			dto.discardTopCard.cardFamily,
			dto.discardTopCard.cardCode,
		);
		const texture = this._assetsManager.getCardTexture(
			dto.discardTopCard.cardFamily,
			dto.discardTopCard.cardCode,
		);
		discardCard.setFaceUpCard(texture, discardCardModel);
		this._discard.setCard(discardCard);

		this.setPilesBackdropColorByCardSet(dto.discardTopCard.cardFamily);
	}

	private resetPlayerHand(dto: RejoinGameDto): void {
		const currentCards = this._playerHand.children.filter(
			(child) => child instanceof UnoCard,
		) as UnoCard[];

		currentCards.forEach((card) => {
			this._playerHand.removeCard(card);
			this._cardPool.returnCard(card);
		});

		for (const cardData of dto.playerHand) {
			const card = this._cardPool.getCard();
			const cardModel = new Card(cardData.cardFamily, cardData.cardCode);
			const texture = this._assetsManager.getCardTexture(
				cardData.cardFamily,
				cardData.cardCode,
			);

			card.setFaceUpCard(texture, cardModel);
			this._playerHand.addCard(card);
		}

		this._playerHand.sortCards();
	}

	private setPilesBackdropColor(color: string): void {
		this._tableCenterArea.setMainColor(color);
	}

	private resolveLocalPlayer(
		players: GameWinPlayerDto[],
		localPlayerId?: string,
	): GameWinPlayerDto | null {
		if (localPlayerId) {
			const byId = players.find((player) => player.id === localPlayerId);
			if (byId) {
				return byId;
			}
		}

		if (!this._localPlayerName) {
			return null;
		}

		const byName = players.find(
			(player) => player.name === this._localPlayerName,
		);
		return byName ?? null;
	}

	public destroy(): void {
		this.hideCardFamilySelector();
		this._turnTimerBar.stop();
		this.cleanupHand(this._playerHand);
		this.cleanupPile(this._deck);
		this.cleanupPile(this._discard);

		this._opponentsManager.destroy();

		if (this.parent) {
			this.parent.removeChild(this);
		}

		super.destroy({ children: true });
	}

	private cleanupHand(hand: Hand): void {
		const cards = hand.children.filter(
			(c) => c instanceof UnoCard,
		) as UnoCard[];

		cards.forEach((c) => {
			hand.removeCard(c);
			this._cardPool.returnCard(c);
		});
	}

	private cleanupPile(pile: CardPile): void {
		const card = pile.card;
		if (card) {
			pile.setCard(null);
			this._cardPool.returnCard(card);
		}
	}
}
