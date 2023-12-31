import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { deck, emptyTypeCard, typeCard } from '../helpers/consts'
import { interfaceAtkAction, interfaceCardsState, interfaceQueueRes, interfaceSortedArrays } from '../helpers/types'

const initialState: interfaceCardsState = {
  deck: [],
  hands: { player: [], bot: [] },
  inGame: { def: [], atk: [] },
  chooseDef: {
    player: { card: emptyTypeCard, index: -1 },
    inGameDefInd: -1,
  },
  whoseMove: "",
  trump: "",
  beatenDeck: [],
}

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    deckShuffling: (state) => {
      const shuffledDeck: typeCard[] = JSON.parse(JSON.stringify(deck));
      for (let i = shuffledDeck.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
      }

      // Козырь
      state.trump = shuffledDeck[shuffledDeck.length - 1].suit;
      console.log(state.trump);

      shuffledDeck.forEach(e => {
        if (e.suit === state.trump) e.rank += 15;
      })

      state.deck = JSON.parse(JSON.stringify(shuffledDeck));

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
      const payload: interfaceAtkAction = action.payload;

      if (state.inGame.atk.length) {
        for (let i in state.inGame.atk) {
          if (
            state.inGame.atk[i].name.split(" ").slice(0, 1)[0] === payload.card.name.split(" ").slice(0, 1)[0] ||
            state.inGame.def[i].name.split(" ").slice(0, 1)[0] === payload.card.name.split(" ").slice(0, 1)[0]
          ) {
            state.hands.player.splice(payload.index, 1);
            state.inGame.atk.push(payload.card);
            break;
          }
        }
      } else {
        state.hands.player.splice(payload.index, 1);
        state.inGame.atk.push(payload.card);
      }
    },

    defCardChoosing: (state, action: PayloadAction<{ card: typeCard, index: number }>) => {
      const payload = action.payload;

      if (!(payload.index === state.chooseDef.player.index)) {
        state.chooseDef.player.card = payload.card;
        state.chooseDef.player.index = payload.index;
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



      // const arrCardRanks: interfaceArrCardRanks[] = [];

      // for (let i in state.hands.bot) {
      //   arrCardRanks[i] = {
      //     rank: state.hands.bot[i].name.split(" ").slice(0, 1)[0],
      //     index: +i,
      //   };
      // };

      // arrCardRanks.sort((a, b) => +a.rank - +b.rank);

      // for (let i in arrCardRanks) {
      //   if (arrCardRanks.filter(e => e.rank === arrCardRanks[i].rank && +e.rank).length == 2) {

      //     state.inGame.atk.push(state.hands.bot[arrCardRanks[i].index]);
      //     // state.hands.bot.splice(arrCardRanks[i].index, 1);
      //     console.log(arrCardRanks.filter(e => e.rank === arrCardRanks[i].rank && +e.rank));
      //     break;
      //   }
      // }

    },

    defBotAction: (state) => {
      // console.log("bot def");
      for (let i in state.inGame.atk) {
        if (!state.inGame.def[i]) {
          for (let j in state.hands.bot) {
            if (state.hands.bot[j].rank > 15) {
              if (state.hands.bot[j].rank > state.inGame.atk[i].rank) {
                state.inGame.def[+i] = state.hands.bot[+j];
                state.hands.bot.splice(+j, 1);
                console.log("j: ", j, "i: ", i, "Первое");
                return;
              }
            } else {
              if (state.hands.bot[j].rank > state.inGame.atk[i].rank && state.hands.bot[j].suit === state.inGame.atk[i].suit) {
                state.inGame.def[+i] = state.hands.bot[+j];
                state.hands.bot.splice(+j, 1);
                console.log("j: ", j, "i: ", i, "Второе");
                return;
              }
            }
          }
        }
      };

      state.hands.bot.splice(-1, 0, ...state.inGame.atk, ...state.inGame.def);
      state.inGame.atk = [];
      state.inGame.def = [];

      //  [...state.hands.bot, ...state.inGame.atk];
    },

    // Bot end


    partEnd: (state) => {
      state.beatenDeck = [...state.beatenDeck, ...state.inGame.def, ...state.inGame.atk];
      state.inGame.def = [];
      state.inGame.atk = [];
      console.log(state.beatenDeck);
      state.whoseMove = (state.whoseMove === "player" ? "bot" : "player");
    }

  },
})

// Action creators are generated for each case reducer function
export const {
  deckShuffling,
  defineQueue,
  atkPlayerAction,
  defCardChoosing,
  defIndexChoosing,
  defPlayerAction,
  pickCards,
  giveCardToBot,
  giveCardToPlayer,
  atkBotAction,
  defBotAction,
  partEnd,
} = counterSlice.actions

export default counterSlice.reducer