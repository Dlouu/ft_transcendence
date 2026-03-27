import {
  IsString,
} from "class-validator";

export interface IRejoinGameFromLobby
{
  id: string;
  name: string;
  backCardURL: string;
  profilePicture: string;
}

export class RejoinGameFromLobbyDto implements IRejoinGameFromLobby {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  backCardURL: string;

  @IsString()
  profilePicture: string;
}
