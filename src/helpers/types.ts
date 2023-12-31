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

export interface interfaceChooseDef {
  player: { card: typeCard, index: number },
  inGameDefInd: number,
}

export interface interfaceCardsState {
  deck: typeCard[],
  hands: interfaceHands,
  inGame: interfaceInGame,
  chooseDef: interfaceChooseDef,
  whoseMove: string,
  trump: string,
  beatenDeck: typeCard[],
}





// 

export interface interfaceAtkAction {
  card: typeCard,
  index: number,
}
