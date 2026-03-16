export enum CardFamily {
  ONE = "set-one",
  TWO = "set-two",
  THREE = "set-three",
  FOUR = "set-four",
  WILD = "wild",
}

export enum CardCode {
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
  Skip = "skip",
  Reverse = "reverse",
  DrawTwo = "drawTwo",
  Wild = "wild",
  WildDrawFour = "wildDrawFour",
}

export enum GameState {
  WAITING_FOR_PLAYERS,
  DEALING,
  PLAYING,
  AWAITING_COLOR_CHOICE,
  GAME_OVER,
}
