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
import { createTableViewport, TableViewport } from "../layout/TableViewport";
import { CardEffectDto } from "../dto/card-effect.dto";

export class TableManager extends Container {
	private static readonly MIDDLE_ARROW_Y_RATIO =
		GAME_CUSTOMIZATION.table.middleArrowYRatio;
	private static readonly MIDDLE_ARROW_SIZE_FROM_CENTER_AREA_RATIO =
		GAME_CUSTOMIZATION.table.middleArrowSizeFromCenterAreaRatio;
	private static readonly UNO_BUTTON_Y_RATIO =
		GAME_CUSTOMIZATION.table.unoButtonYRatio;
	private static readonly UNO_BUTTON_WIDTH_RATIO =
		GAME_CUSTOMIZATION.table.unoButtonWidthRatio;
	private static readonly TURN_TIMER_DURATION_MS =
		GAME_CUSTOMIZATION.table.turnTimer.durationMs;
	private static readonly EFFECT_CARD_RENDER_DURATION_MS =
		GAME_CUSTOMIZATION.effectCard.renderDurationMs;
	private static readonly EFFECT_CARD_BETWEEN_HAND_AND_CENTER_RATIO =
		GAME_CUSTOMIZATION.effectCard.betweenHandAndCenterRatio;
	private static readonly EFFECT_CARD_HEIGHT_RATIO =
		GAME_CUSTOMIZATION.effectCard.heightRatio;
	private static readonly EFFECT_CARD_RATIO =
		GAME_CUSTOMIZATION.effectCard.cardRatio;

	private _playerIndex: number = -1;
	private _middleArrow: Sprite;
	private _unoButton: UnoButton;
	private _turnTimerBar: TurnTimerBar;
	private _tableWidth: number = 0;
	private _tableHeight: number = 0;
	private _viewport: TableViewport = createTableViewport(1, 1);
	private _isMiddleArrowMirrored: boolean = false;

	private _tableCenterArea: TableCenterArea;
	private _cardFamilySelector: CardFamilySelector | null = null;
	private _victoryScreen: VictoryScreen;
	private _effectLayer: Container;
	private _activeEffectCard: UnoCard | null = null;
	private _activeEffectTargetPlayerIndex: number = -1;
	private _effectCardCleanupTimeoutId: number | null = null;

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
		this._effectLayer = new Container();
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
		this.addChild(this._effectLayer);
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
		this.clearCardEffect();
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
		this.clearCardEffect();
		this.setUnoButtonVisible(false);
		this._turnTimerBar.stop();
		this._playerHand.setTurnActive(false);
		this._opponentsManager.setActivePlayer(-1);

		this._victoryScreen.show(dto, isVictory);
		this._victoryScreen.resize(
			this._viewport.canvasWidth,
			this._viewport.canvasHeight,
			this._viewport,
		);
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
			this._viewport.centerX,
			this._viewport.centerY,
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

	public updateOpponentInfo(
		playerIndex: number,
		name: string,
		cardBackVariant: string,
	): void {
		this._opponentsManager.updateOpponentInfo(
			playerIndex,
			name,
			cardBackVariant,
		);
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

	public showCardEffect(effectDto: CardEffectDto): void {
		this.clearCardEffect();

		const anchor = this.resolveEffectAnchorForPlayer(
			effectDto.affectedPlayerIndex,
		);
		if (!anchor) {
			return;
		}

		if (this._effectLayer.parent === this) {
			// Re-append to keep this layer above other gameplay elements.
			this.addChild(this._effectLayer);
		}

		const displayFamily =
			effectDto.card.cardCode === "wild" ||
			effectDto.card.cardCode === "wildDrawFour"
				? CardFamily.WILD
				: effectDto.card.cardFamily;

		const effectCard = this._cardPool.getCard();
		const effectCardModel = new Card(displayFamily, effectDto.card.cardCode);
		const texture = this._assetsManager.getCardTexture(
			displayFamily,
			effectDto.card.cardCode,
		);

		effectCard.setFaceUpCard(texture, effectCardModel);
		effectCard.position.set(anchor.x, anchor.y);
		effectCard.rotation = 0;
		effectCard.alpha = 1;
		const effectCardHeight =
			this._viewport.tableHeight * TableManager.EFFECT_CARD_HEIGHT_RATIO;
		effectCard.height = effectCardHeight;
		effectCard.width = effectCardHeight * TableManager.EFFECT_CARD_RATIO;

		this._activeEffectCard = effectCard;
		this._activeEffectTargetPlayerIndex = effectDto.affectedPlayerIndex;
		this._effectLayer.addChild(effectCard);

		this._effectCardCleanupTimeoutId = window.setTimeout(() => {
			this.clearCardEffect();
		}, TableManager.EFFECT_CARD_RENDER_DURATION_MS);
	}

	public resize(width: number, height: number): void {
		this._viewport = createTableViewport(width, height);
		this._tableWidth = this._viewport.tableWidth;
		this._tableHeight = this._viewport.tableHeight;

		this.updateMiddleArrow(this._viewport);

		this._playerHand.position.set(
			this._viewport.centerX,
			this._viewport.offsetY +
				this._viewport.tableHeight * GAME_CUSTOMIZATION.table.playerHandYRatio,
		);
		this._playerHand.resize(width, height, this._viewport);

		this._opponentsManager.resize(width, height, this._viewport);

		this._tableCenterArea.update(width, height, this._viewport);

		const pilesOffset =
			this._viewport.tableWidth / GAME_CUSTOMIZATION.table.pilesOffsetDivisor;

		this._deck.position.set(
			this._viewport.centerX - pilesOffset,
			this._viewport.centerY,
		);
		this._deck.resize(width, height, this._viewport);

		this._discard.position.set(
			this._viewport.centerX + pilesOffset,
			this._viewport.centerY,
		);
		this._discard.resize(width, height, this._viewport);

		this._unoButton.resize(
			width,
			height,
			TableManager.UNO_BUTTON_Y_RATIO,
			TableManager.UNO_BUTTON_WIDTH_RATIO,
			this._viewport,
		);

		this._turnTimerBar.resize(width, height, this._viewport);

		if (this._cardFamilySelector) {
			this._cardFamilySelector.position.set(
				this._viewport.centerX,
				this._viewport.centerY,
			);
		}

		this.updateEffectCardPosition();

		this._victoryScreen.resize(width, height, this._viewport);
	}

	private updateMiddleArrow(viewport: TableViewport): void {
		if (this._middleArrow.texture === Texture.EMPTY) {
			this._middleArrow.texture = this._assetsManager.arrowTexture;
		}

		const mainAreaWidth =
			viewport.tableWidth * TableCenterArea.MAIN_WIDTH_RATIO;
		const mainAreaHeight = mainAreaWidth * TableCenterArea.MAIN_ASPECT_RATIO;
		const targetMajorSize =
			mainAreaWidth * TableManager.MIDDLE_ARROW_SIZE_FROM_CENTER_AREA_RATIO;

		const textureWidth = this._middleArrow.texture.width || 1;
		const textureHeight = this._middleArrow.texture.height || 1;
		const textureAspect = textureWidth / textureHeight;

		let arrowWidth = targetMajorSize;
		let arrowHeight = targetMajorSize;
		if (textureAspect >= 1) {
			arrowHeight = targetMajorSize / textureAspect;
		} else {
			arrowWidth = targetMajorSize * textureAspect;
		}

		const preferredY = viewport.centerY - mainAreaHeight * 0.2;
		const fallbackY =
			viewport.offsetY +
			viewport.tableHeight * TableManager.MIDDLE_ARROW_Y_RATIO;
		const minY = viewport.offsetY + viewport.tableHeight * 0.2;
		const maxY = viewport.offsetY + viewport.tableHeight * 0.48;
		const arrowY = Math.max(minY, Math.min(maxY, (preferredY + fallbackY) / 2));

		this._middleArrow.position.set(viewport.centerX, arrowY);
		this._middleArrow.width = arrowWidth;
		this._middleArrow.height = arrowHeight;
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

	public async applyRejoinState(dto: RejoinGameDto): Promise<void> {
		this._playerIndex = this.resolveRejoinPlayerIndex(dto);
		// Ensure the deck card exists before updating it
		this.ensureDeckCardForRejoin();

		this._tableCenterArea.setColors({
			...this._assetsManager.getThemeBackdropColors(),
		});

		// Load and set deck card back for player
		if (this._deck.card) {
			await this._assetsManager.loadCardBacks([dto.playerCardBackUrl]);
			this._deck.card.setFaceBackCard(
				this._assetsManager.getCardBack(dto.playerCardBackUrl),
				null,
			);
		}

		// Ensure opponents are created with correct cardBack and profilePicture
		this._opponentsManager.ensureOpponentsForRejoin(dto.opponents);

		// Update opponents' cardBack and profilePicture
		for (const opponent of dto.opponents) {
			await this._assetsManager.loadCardBacks([opponent.cardBackUrl]);
			this._opponentsManager.updateOpponentInfo(
				opponent.index,
				opponent.name,
				opponent.cardBackUrl,
				opponent.profilePictureUrl,
			);
		}

		// Reset player hand (cards themselves don't show cardBack/profilePicture, but could be extended)
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
		this.clearCardEffect();
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
		this.clearCardEffect();
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

	private resolveEffectAnchorForPlayer(
		playerIndex: number,
	): { x: number; y: number } | null {
		const handCenter =
			playerIndex === this._playerIndex
				? {
						x: this._playerHand.position.x,
						y: this._playerHand.position.y,
					}
				: this._opponentsManager.getOpponentHandCenter(playerIndex);

		if (!handCenter) {
			return null;
		}

		const t = TableManager.EFFECT_CARD_BETWEEN_HAND_AND_CENTER_RATIO;
		return {
			x: handCenter.x + (this._viewport.centerX - handCenter.x) * t,
			y: handCenter.y + (this._viewport.centerY - handCenter.y) * t,
		};
	}

	private updateEffectCardPosition(): void {
		if (!this._activeEffectCard) {
			return;
		}

		const anchor = this.resolveEffectAnchorForPlayer(
			this._activeEffectTargetPlayerIndex,
		);
		if (!anchor) {
			return;
		}

		this._activeEffectCard.position.set(anchor.x, anchor.y);
		const effectCardHeight =
			this._viewport.tableHeight * TableManager.EFFECT_CARD_HEIGHT_RATIO;
		this._activeEffectCard.height = effectCardHeight;
		this._activeEffectCard.width =
			effectCardHeight * TableManager.EFFECT_CARD_RATIO;
	}

	private clearCardEffect(): void {
		if (this._effectCardCleanupTimeoutId !== null) {
			window.clearTimeout(this._effectCardCleanupTimeoutId);
			this._effectCardCleanupTimeoutId = null;
		}

		if (!this._activeEffectCard) {
			this._activeEffectTargetPlayerIndex = -1;
			return;
		}

		if (this._activeEffectCard.parent === this._effectLayer) {
			this._effectLayer.removeChild(this._activeEffectCard);
		}
		this._cardPool.returnCard(this._activeEffectCard);
		this._activeEffectCard = null;
		this._activeEffectTargetPlayerIndex = -1;
	}
}
