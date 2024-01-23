import { typeCard } from "./consts";

export interface interfaceInGame {
  def: typeCard[],
  atk: typeCard[],
}
export interface interfaceSortedArrays {
  username: string,
  ranks: number[];
}
export interface interfaceQueueRes {
  username: string,
  rank: number;
}

export interface interfaceHands {
  player: typeCard[],
  bot: typeCard[],
}

export interface interfaceChosenCard {
  card: typeCard,
  index: number,
}

export interface interfaceChooseDef {
  player: interfaceChosenCard,
  inGameDefInd: number,
}

export interface interfaceCardsState {
  deck: typeCard[],
  hands: interfaceHands,
  inGame: interfaceInGame,
  chooseDef: interfaceChooseDef,
  chooseAtk: number[],
  whoseMove: string,
  trump: string,
  beatenDeck: typeCard[],
  isBotBeat: boolean,
}

export interface interfaceSortedCards {
  "♦️": typeCard[],
  "♣️": typeCard[],
  "♠️": typeCard[],
  "♥️": typeCard[],
}



// 

export interface interfaceAtkAction {
  card: typeCard,
  index: number,
}


