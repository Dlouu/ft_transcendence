import { Assets, Spritesheet, Texture } from "pixi.js";
import { CardCode, CardFamily, CardsTheme } from "../domain/GameEnums";
import { GAME_CUSTOMIZATION } from "../config/gameCustomization";

type ThemeSetMetadata = {
	hex?: string;
};

type ThemeMetadata = {
	uno?: {
		sets?: Partial<Record<CardFamily, ThemeSetMetadata>>;
	};
};

export class AssetsManager {
	private _spritesheet: Spritesheet | null = null;
	private _backTextures: Map<string, Texture> = new Map();
	private _arrowTexture: Texture = Texture.EMPTY;
	private _themeBackdropColors: Partial<Record<CardFamily, string>> = {};
	private _arrowTextureLoadingPromise: Promise<void> | null = null;

	private async _loadArrowTexture(): Promise<void> {
		try {
			const texture = await Assets.load<Texture>(
				GAME_CUSTOMIZATION.assets.arrowTexturePath,
			);
			if (texture) {
				this._arrowTexture = texture;
			}
		} catch (error) {
			console.error("Error loading arrow texture:", error);
		}
	}

	public async loadArrowTexture(): Promise<void> {
		if (this._arrowTexture !== Texture.EMPTY) {
			return;
		}

		if (!this._arrowTextureLoadingPromise) {
			this._arrowTextureLoadingPromise = this._loadArrowTexture();
		}

		await this._arrowTextureLoadingPromise;
	}

	private _normalizeThemeFileName(theme: CardsTheme): string {
		return (
			GAME_CUSTOMIZATION.assets.themeFileByTheme[theme] ?? `${theme}-theme.json`
		);
	}

	private _buildTextureKeys(color: CardFamily, value: CardCode): string[] {
		const baseKey = `${color}-${value}`;
		const aliasByValue: Partial<Record<CardCode, string>> = {
			[CardCode.DrawTwo]: "draw2",
			[CardCode.Wild]: "color",
			[CardCode.WildDrawFour]: "draw4",
		};

		const aliasedValue = aliasByValue[value];
		const keys = [baseKey, `${baseKey}.png`];

		if (aliasedValue) {
			keys.unshift(`${color}-${aliasedValue}`);
			if (color === CardFamily.WILD) {
				keys.unshift(`wild_${aliasedValue}`);
			}
		}

		return keys;
	}

	private _normalizeCardBackVariant(variant: string): string {
		return variant.trim();
	}

	private _isUrlVariant(variant: string): boolean {
		return (
			variant.startsWith("http://") ||
			variant.startsWith("https://") ||
			variant.startsWith("/")
		);
	}

	private _getCardBackLookupKeys(variant: string): string[] {
		const normalized = this._normalizeCardBackVariant(variant);
		const keys = new Set<string>([variant, normalized]);

		if (this._isUrlVariant(normalized)) {
			try {
				const url = new URL(normalized, window.location.origin);
				keys.add(url.toString());
				keys.add(url.href);
				keys.add(url.pathname);

				const pathname = url.pathname;
				const filename = pathname.split("/").pop();
				if (filename) {
					keys.add(filename);
					keys.add(filename.replace(/\.[^.]+$/, ""));
				}
			} catch {
				const filename = normalized.split("/").pop();
				if (filename) {
					keys.add(filename);
					keys.add(filename.replace(/\.[^.]+$/, ""));
				}
			}
		}

		return [...keys].filter(Boolean);
	}

	public async loadTheme(theme: CardsTheme): Promise<void> {
		const fileName = this._normalizeThemeFileName(theme);

		const assetPath = `${fileName}`;

		try {
			this._spritesheet = await Assets.load(assetPath);
			this._themeBackdropColors = this._extractThemeBackdropColors(
				this._spritesheet?.data as ThemeMetadata,
			);

			if (!this._spritesheet) {
				console.error(`Failed to load spritesheet for theme: ${theme}`);
			}
		} catch (error) {
			console.error(`Error loading theme ${theme}:`, error);
		}
	}

	private _extractThemeBackdropColors(
		metadata: ThemeMetadata | undefined,
	): Partial<Record<CardFamily, string>> {
		const sets = metadata?.uno?.sets;

		if (!sets) {
			return {};
		}

		const colors: Partial<Record<CardFamily, string>> = {};

		for (const family of [
			CardFamily.ONE,
			CardFamily.TWO,
			CardFamily.THREE,
			CardFamily.FOUR,
		]) {
			const hex = sets[family]?.hex;
			if (hex) {
				colors[family] = hex;
			}
		}

		return colors;
	}

	public async loadCardBacks(
		variants: string[] = [...GAME_CUSTOMIZATION.app.defaultCardBackVariants],
	): Promise<void> {
		const loadPromises = variants.map(async (variant) => {
			const normalizedVariant = this._normalizeCardBackVariant(variant);
			if (!normalizedVariant) {
				return;
			}

			const isUrl = this._isUrlVariant(normalizedVariant);
			const assetPath = isUrl
				? normalizedVariant
				: `${normalizedVariant}${GAME_CUSTOMIZATION.assets.cardBackFileSuffix}`;

			try {
				const texture = await Assets.load<Texture>(assetPath);
				if (texture) {
					for (const key of this._getCardBackLookupKeys(normalizedVariant)) {
						this._backTextures.set(key, texture);
					}
				}
			} catch (error) {
				console.error(
					`Error loading card back '${normalizedVariant}' : `,
					error,
				);
			}
		});

		await Promise.all(loadPromises);
	}

	public getCardTexture(color: CardFamily, value: CardCode): Texture {
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

		console.warn(
			`AssetsManager: Texture not found for keys: ${keys.join(", ")}`,
		);
		return Texture.EMPTY;
	}

	// TODO: Somewhere in this file, fix profile pictures
	// TODO: Card Variant "Basic"
	public getCardBack(
		variant: string = GAME_CUSTOMIZATION.assets.defaultCardBackVariant,
	): Texture {
		for (const key of this._getCardBackLookupKeys(variant)) {
			const texture = this._backTextures.get(key);
			if (texture) {
				return texture;
			}
		}

		const fallbackVariant = GAME_CUSTOMIZATION.table.defaultRejoinCardBackVariant;
		for (const fallbackKey of this._getCardBackLookupKeys(fallbackVariant)) {
			const fallbackTexture = this._backTextures.get(fallbackKey);
			if (fallbackTexture) {
				console.warn(
					`AssetsManager: Card back variant '${variant}' not found. Falling back to '${fallbackVariant}'.`,
				);
				return fallbackTexture;
			}
		}

		const firstLoadedTexture = this._backTextures.values().next().value;
		if (firstLoadedTexture) {
			console.warn(
				`AssetsManager: Card back variant '${variant}' not found. Falling back to first loaded card back texture.`,
			);
			return firstLoadedTexture;
		}

		console.warn(`AssetsManager: Card back variant '${variant}' not found.`);
		return Texture.EMPTY;
	}

	public get isLoaded(): boolean {
		return this._spritesheet !== null;
	}

	public get arrowTexture(): Texture {
		return this._arrowTexture;
	}

	public getThemeBackdropColors(): Partial<Record<CardFamily, string>> {
		return { ...this._themeBackdropColors };
	}
}
