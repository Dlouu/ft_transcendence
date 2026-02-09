import { Assets, Spritesheet, Texture } from 'pixi.js';

export enum CardsTheme
{
    Normal = "normal",
    Uwu = "uwu"
}

export enum CardSet
{
    One = 'set_one',
    Two = 'set_two',
    Three = 'set_three',
    Four = 'set_four',
    Wild = 'black'
}

export enum CardValue
{
    Zero = '0',
    One = '1',
    Two = '2',
    Three = '3',
    Four = '4',
    Five = '5',
    Six = '6',
    Seven = '7',
    Eight = '8',
    Nine = '9',
    PlusTwo = 'plus2',
    Reverse = 'reverse',
    Skipp = 'skip',
    Wild = 'wild',
    PlusFour = 'plus4'
}

export class AssetsManager
{
    private _spritesheet: Spritesheet | null = null;
    private _backTextures: Map<string, Texture> = new Map();

    public async loadTheme(theme: CardsTheme): Promise<void>
    {
        const fileName = `${theme}-theme.json`;

        const assetPath = `game/${fileName}`;

        try
        {
            this._spritesheet = await Assets.load(assetPath);
            
            if (!this._spritesheet)
            {
                console.error(`Failed to load spritesheet for theme: ${theme}`);
            }
        }
        catch (error)
        {
            console.error(`Error loading theme ${theme}:`, error);
        }
    }

	/**
     * Loads standalone textures for card backs based on the current theme.
     * Assumes files are named: assets/{theme}-back-{variant}.png
     * @param variants Array of variant names, e.g., ['default', 'alt']
     */
    public async loadCardBacks(variants: string[] = ['default']): Promise<void>
    {
        // Clear previous theme backs if needed, or keep cache depending on needs.
        // For now, we clear to ensure we only have current theme backs.
        this._backTextures.clear();

        const loadPromises = variants.map(async (variant) => 
        {
            const key = variant;
            const assetPath = `game/${variant}-back.png`;

            try
            {
                const texture = await Assets.load<Texture>(assetPath);
                if (texture)
                {
                    this._backTextures.set(key, texture);
                }
            }
            catch (error)
            {
                console.error(`Error loading card back '${variant}' : `, error);
            }
        });

        await Promise.all(loadPromises);
    }

    /**
     * Retrieves a texture from the loaded spritesheet.
     * Use CardSet and CardValue enums to build the key.
     * Example Key format: "one-0.png"
     */
    public getCardTexture(color: CardSet, value: CardValue): Texture
    {
        if (!this._spritesheet)
        {
            console.error('AssetsManager: Spritesheet not loaded yet.');
            return Texture.EMPTY;
        }

        const key = `${color}-${value}.png`;

        if (this._spritesheet.textures[key])
        {
            return this._spritesheet.textures[key];
        }

        console.warn(`AssetsManager: Texture not found for key: ${key}`);
        return Texture.EMPTY;
    }

    /**
     * Retrieves a loaded card back texture.
     * @param variant The variant name used during loadCardBacks (default: 'default')
     */
    public getCardBack(variant: string = 'default'): Texture
    {
        if (this._backTextures.has(variant))
        {
            return this._backTextures.get(variant)!;
        }

        console.warn(`AssetsManager: Card back variant '${variant}' not found.`);
        return Texture.EMPTY;
    }

    public get isLoaded(): boolean
    {
        return this._spritesheet !== null;
    }
}
