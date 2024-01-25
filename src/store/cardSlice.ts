import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { deck, emptyTypeCard, suitsList, typeCard } from '../helpers/consts'
import { interfaceAtkAction, interfaceCardsState, interfaceChosenCard, interfaceQueueRes, interfaceSortedArrays, interfaceSortedCards } from '../helpers/types'
import { getCardSign } from '../helpers/functions'

const initialState: interfaceCardsState = {
  deck: [],
  hands: { player: [], bot: [] },
  inGame: { def: [], atk: [] },
  chooseDef: {
    player: { card: emptyTypeCard, index: -1 },
    inGameDefInd: -1,
  },
  chooseAtk: [],
  whoseMove: "",
  trump: "",
  beatenDeck: [],
  isBotBeat: true
}

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    deckShuffling: (state) => {
      let shuffledDeck: typeCard[] = JSON.parse(JSON.stringify(deck));
      for (let i = shuffledDeck.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
      }
      // shuffledDeck = deck;

      // Козырь
      state.trump = getCardSign(shuffledDeck[shuffledDeck.length - 1].name, true);
      console.log(state.trump);

      shuffledDeck.forEach(e => {
        if (getCardSign(e.name, true) === state.trump) e.rank += 15;
      })

      state.deck = JSON.parse(JSON.stringify(shuffledDeck));
      // state.deck = deck;

      console.log(state.deck)

      // Раздача карт
      state.hands.player = state.deck.splice(0, 6);
      state.hands.bot = state.deck.splice(0, 6);
    },

    defineQueue: (state) => {
      let smallTrumpPlayer: interfaceQueueRes = { username: "", rank: 100 };
      const arr: interfaceSortedArrays[] = [];

      for (let i in state.hands) {
        const arrIn: number[] = [];
        for (let j of state.hands[i]) {
          arrIn.push(j.rank);
        }

        arrIn.sort((a, b) => a - b);
        const lessThanOrEqual15 = arrIn.filter((value) => value <= 15);
        const greaterThan15 = arrIn.filter((value) => value > 15);
        const sortedArray = greaterThan15.concat(lessThanOrEqual15);

        arr.push({ username: i, ranks: sortedArray });
      }

      for (let i of arr) {
        if (i.ranks[0] < smallTrumpPlayer.rank) {
          smallTrumpPlayer.username = i.username;
          smallTrumpPlayer.rank = i.ranks[0];
        }
      }

      state.whoseMove = smallTrumpPlayer.username;
      console.log(state.whoseMove);
    },

    atkPlayerAction: (state, action: PayloadAction<interfaceAtkAction>) => {
      const { card, index }: interfaceAtkAction = action.payload;

      // if (state.inGame.atk.length) {
      //   for (let i in state.inGame.atk) {
      //     if (
      //       state.inGame.atk[i].name.split(" ").slice(0, 1)[0] === card.name.split(" ").slice(0, 1)[0] ||
      //       state.inGame.def[i].name.split(" ").slice(0, 1)[0] === card.name.split(" ").slice(0, 1)[0]
      //     ) {
      //       state.hands.player.splice(index, 1);
      //       state.inGame.atk.push(card);
      //       break;
      //     }
      //   }
      // } else {
      state.hands.player.splice(index, 1);
      state.inGame.atk.push(card);
      // }
    },

    tossCardChoosing: (state, action: PayloadAction<{ index: number, toggle: boolean, needNull: boolean }>) => {
      const { index, toggle, needNull } = action.payload;
      if (needNull) {
        state.chooseAtk = [];
      }
      if (toggle) {
        state.chooseAtk.push(index);
      } else {
        state.chooseAtk = state.chooseAtk.filter(e => e !== index);
      }
    },

    tossCardPlayer: (state) => {
      const atk: typeCard[] = [];
      const newHandsPlayer: typeCard[] = [];

      for (let i in state.chooseAtk) {
        atk.push(state.hands.player[state.chooseAtk[i]]);
      }

      for (let i = 0; i < state.hands.player.length; i++) {
        if (!state.chooseAtk.includes(i)) {
          newHandsPlayer.push(state.hands.player[i]);
        }
      }

      state.hands.player = newHandsPlayer;
      state.inGame.atk.push(...atk);

      state.chooseAtk = [];
      state.chooseDef = {
        player: {
          card: emptyTypeCard,
          index: -1,
        }, inGameDefInd: -1
      }
    },

    defCardChoosing: (state, action: PayloadAction<interfaceChosenCard>) => {
      const { card, index } = action.payload;

      if (!(index === state.chooseDef.player.index)) {
        state.chooseDef.player.card = card;
        state.chooseDef.player.index = index;
      } else {
        state.chooseDef.player.card = emptyTypeCard;
        state.chooseDef.player.index = -1;
      }
      console.log(state.chooseDef.player);
    },

    defIndexChoosing: (state, action: PayloadAction<number>) => {
      const payload = action.payload;

      if (state.chooseDef.player.card.name &&
        state.chooseDef.player.card.rank > state.inGame.atk[payload].rank &&
        (
          state.chooseDef.player.card.rank > 15 ||
          state.chooseDef.player.card.suit === state.inGame.atk[payload].suit
        )
      ) {
        state.chooseDef.inGameDefInd = payload;
      }
    },

    defPlayerAction: (state) => {
      state.hands.player.splice(Number(state.chooseDef.player.index), 1);
      state.inGame.def[state.chooseDef.inGameDefInd] = state.chooseDef.player.card;

      state.chooseDef = {
        inGameDefInd: -1,
        player: { card: emptyTypeCard, index: -1 },
      }
    },

    reversePlayerMove: (state) => {
      state.inGame.atk.push(state.chooseDef.player.card);
      state.hands.player.splice(state.chooseDef.player.index, 1);
      state.whoseMove = "player";
      // state.chooseDef.player.card;
      state.chooseAtk = [];
      state.chooseDef = {
        player: {
          card: emptyTypeCard,
          index: -1,
        }, inGameDefInd: -1
      }
    },

    pickCards: (state) => {
      state.hands.player.splice(-1, 0, ...state.inGame.atk, ...state.inGame.def);
      state.inGame.atk = [];
      state.inGame.def = [];

    },

    giveCardToPlayer: (state) => {
      // for (let i = 0; i < (6 - state.hands.player.length); i++) {
      state.hands.player.splice(0, -1, ...state.deck.splice(0, (6 - state.hands.player.length)));

      // }
    },
    giveCardToBot: (state) => {
      state.hands.bot.splice(0, -1, ...state.deck.splice(0, (6 - state.hands.bot.length)));
    },

    // Bot
    atkBotAction: (state) => {
      state.inGame.atk.push(state.hands.bot[0]);
      state.hands.bot.splice(0, 1);
    },

    defBotAction: (state) => {
      // ! Reverse the move
      if (!state.inGame.def.length) {
        for (let i in state.hands.bot) {
          if (getCardSign(state.inGame.atk[0].name) === getCardSign(state.hands.bot[i].name)) {
            state.inGame.atk.push(state.hands.bot[i]);
            state.hands.bot.splice(+i, 1);
            state.whoseMove = "bot";
            return;
          }
        }
      }

      // ! Defend structure
      function sortCardBySuits(cardArr: typeCard[], isInGame?: boolean) {
        const sortedCards: interfaceSortedCards = {
          "♦️": [],
          "♣️": [],
          "♠️": [],
          "♥️": [],
        }

        for (let i of suitsList) {
          sortedCards[i] = isInGame ?
            cardArr.filter((e, index) => getCardSign(e.name, true) == i && !state.inGame.def[index])
            :
            cardArr.filter(e => getCardSign(e.name, true) == i);

          sortedCards[i] = sortedCards[i].sort((a: typeCard, b: typeCard) => a.rank - b.rank);
        }
        return sortedCards;
      }

      const atkCards = sortCardBySuits(state.inGame.atk, true);
      const botCards = sortCardBySuits(state.hands.bot);

      const defCards: typeCard[] = [];
      Object.assign(defCards, state.inGame.def);


      for (let i in atkCards) {
        for (let j in atkCards[i]) {
          let card = "";
          if (i !== state.trump) {
            for (let k in botCards[i]) {
              if (botCards[i][k]?.rank > atkCards[i][j]?.rank) {
                card = botCards[i][k].name;
                defCards[state.inGame.atk.indexOf(atkCards[i][j])] = botCards[i][k];
                botCards[i][k] = null;

                break;
              }
            }
          }

          if (!card) {
            for (let k in botCards[state.trump]) {
              if (
                (state.deck.length > (state.deck.length - 15) && botCards[state.trump][k]?.rank >= 25) ||
                (state.deck.length > (state.deck.length - 18) && botCards[state.trump][k]?.rank >= 26) ||
                (state.deck.length == 0 && botCards[state.trump][k]?.rank >= 27)
              ) {
                continue;
              };

              if (botCards[state.trump][k]?.rank > atkCards[i][j]?.rank) {
                card = botCards[state.trump][k].name;
                defCards[state.inGame.atk.indexOf(atkCards[i][j])] = botCards[state.trump][k];
                botCards[state.trump][k] = null;

                break;
              }
            }

            break;
          }
        }
      }

      if (defCards.length !== state.inGame.atk.length) {
        state.isBotBeat = false;
      } else {
        state.inGame.def = defCards;

        for (let i of defCards) {
          state.hands.bot.splice(state.hands.bot.indexOf(i), 1);
        }
      }
    },

    botCanBring: (state) => {
      state.hands.bot = [...state.hands.bot, ...state.inGame.def, ...state.inGame.atk];
      state.inGame = { atk: [], def: [] };
      state.whoseMove = "player";
      state.isBotBeat = true;
      state.chooseAtk = [];
      state.chooseDef = {
        player: {
          card: emptyTypeCard,
          index: -1,
        }, inGameDefInd: -1
      }
    },

    // Bot end


    partEnd: (state) => {
      state.beatenDeck = [...state.beatenDeck, ...state.inGame.def, ...state.inGame.atk];
      state.inGame.def = [];
      state.inGame.atk = [];
      state.whoseMove = (state.whoseMove === "player" ? "bot" : "player");
      state.chooseAtk = [];
      state.chooseDef = {
        player: {
          card: emptyTypeCard,
          index: -1,
        }, inGameDefInd: -1
      }
      // state.chooseDef.player = { card: emptyTypeCard, index: -1 };
    }

  },
})

// Action creators are generated for each case reducer function
export const {
  deckShuffling,
  defineQueue,
  atkPlayerAction,
  tossCardPlayer,
  tossCardChoosing,
  defCardChoosing,
  defIndexChoosing,
  defPlayerAction,
  reversePlayerMove,
  pickCards,
  giveCardToBot,
  giveCardToPlayer,
  atkBotAction,
  defBotAction,
  botCanBring,
  partEnd,
} = counterSlice.actions

export default counterSlice.reducer