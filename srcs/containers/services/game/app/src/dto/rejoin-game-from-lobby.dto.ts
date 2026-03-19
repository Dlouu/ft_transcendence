import {
  IsString,
} from "class-validator";

export interface IRejoinGameFromLobby
{
  id: string;
  name: string;
  backCardURL: string;
}

export class RejoinGameFromLobbyDto implements IRejoinGameFromLobby {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  backCardURL: string;
}
