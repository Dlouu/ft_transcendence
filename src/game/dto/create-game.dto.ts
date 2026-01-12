export class CreateGameDto {
  roomName: string;
  playerIds: string[]; // UUIDs (or something else, i'm not sure)
  hasAi: boolean;
}
