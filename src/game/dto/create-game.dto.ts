export class CreateGameDto {
  roomName: string;
  players: playerInfo[];
}

export class playerInfo {
  name: string;
  isAi: boolean;
}