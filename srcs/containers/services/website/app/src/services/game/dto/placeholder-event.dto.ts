import { IsString } from "class-validator";

export interface IPlaceholderEvent {
	message: string;
}

export class PlaceholderEventDto implements IPlaceholderEvent {
	@IsString()
	message: string;
}
