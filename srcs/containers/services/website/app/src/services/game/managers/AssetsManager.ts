import { Assets, Spritesheet, Texture } from "pixi.js";

export enum CardsTheme {
	Basic = "basic",
	Uwu = "uwu",
}

export enum CardSet {
	One = "set-one",
	Two = "set-two",
	Three = "set-three",
	Four = "set-four",
	Wild = "wild",
}

export enum CardValue {
	Zero = "zero",
	One = "one",
	Two = "two",
	Three = "three",
	Four = "four",
	Five = "five",
	Six = "six",
	Seven = "seven",
	Eight = "eight",
	Nine = "nine",
	Skipp = "skip",
	Reverse = "reverse",
	PlusTwo = "drawTwo",
	Wild = "wild",
	PlusFour = "wildDrawFour",
}

export class AssetsManager {
	private _spritesheet: Spritesheet | null = null;
	private _backTextures: Map<string, Texture> = new Map();

	private _normalizeThemeFileName(theme: CardsTheme): string {
		switch (theme) {
			case CardsTheme.Basic:
				return "basic-theme.json";
			case CardsTheme.Uwu:
				return "uwu-theme.json";
			default:
				return `${theme}-theme.json`;
		}
	}

	private _buildTextureKeys(color: CardSet, value: CardValue): string[] {
		const baseKey = `${color}-${value}`;
		const aliasByValue: Partial<Record<CardValue, string>> = {
			[CardValue.PlusTwo]: "draw2",
			[CardValue.Wild]: "color",
			[CardValue.PlusFour]: "draw4",
		};

		const aliasedValue = aliasByValue[value];
		const keys = [baseKey, `${baseKey}.png`];

		if (aliasedValue) {
			keys.unshift(`${color}-${aliasedValue}`);
			if (color === CardSet.Wild) {
				keys.unshift(`wild_${aliasedValue}`);
			}
		}

		return keys;
	}

	public async loadTheme(theme: CardsTheme): Promise<void> {
		const fileName = this._normalizeThemeFileName(theme);

		const assetPath = `${fileName}`;

		try {
			this._spritesheet = await Assets.load(assetPath);

			if (!this._spritesheet) {
				console.error(`Failed to load spritesheet for theme: ${theme}`);
			}
		} catch (error) {
			console.error(`Error loading theme ${theme}:`, error);
		}
	}

	public async loadCardBacks(variants: string[] = ["uwu"]): Promise<void> {
		// Clear previous theme backs if needed, or keep cache depending on needs.
		// For now, we clear to ensure we only have current theme backs.
		this._backTextures.clear();

		const loadPromises = variants.map(async (variant) => {
			const key = variant;
			const assetPath = `${variant}-back.png`;

			try {
				const texture = await Assets.load<Texture>(assetPath);
				if (texture) {
					this._backTextures.set(key, texture);
				}
			} catch (error) {
				console.error(`Error loading card back '${variant}' : `, error);
			}
		});

		await Promise.all(loadPromises);
	}

	public getCardTexture(color: CardSet, value: CardValue): Texture {
		if (!this._spritesheet) {
			console.error("AssetsManager: Spritesheet not loaded yet.");
			return Texture.EMPTY;
		}

		const keys = this._buildTextureKeys(color, value);

		for (const key of keys) {
			if (this._spritesheet.textures[key]) {
				return this._spritesheet.textures[key];
			}
		}

		console.warn(`AssetsManager: Texture not found for keys: ${keys.join(", ")}`);
		return Texture.EMPTY;
	}

	public getCardBack(variant: string = "default"): Texture {
		if (this._backTextures.has(variant)) {
			return this._backTextures.get(variant)!;
		}

		console.warn(`AssetsManager: Card back variant '${variant}' not found.`);
		return Texture.EMPTY;
	}

	public get isLoaded(): boolean {
		return this._spritesheet !== null;
	}
}
