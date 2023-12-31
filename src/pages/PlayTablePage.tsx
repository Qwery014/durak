import React, { useEffect } from 'react';

import "../styles/PlayTablePage.scss";
import Card from '../components/Card';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { atkBotAction, deckShuffling, defBotAction, defPlayerAction, defineQueue, giveCardToBot, giveCardToPlayer, partEnd, pickCards } from '../store/cardSlice';



const PlayTablePage: React.FC = () => {

  const inGame = useSelector((state: RootState) => state.card.inGame);
  const hands = useSelector((state: RootState) => state.card.hands);
  const deck = useSelector((state: RootState) => state.card.deck);
  const whoseMove = useSelector((state: RootState) => state.card.whoseMove);
  const chooseDef = useSelector((state: RootState) => state.card.chooseDef);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(deckShuffling());
    dispatch(defineQueue());
  }, []);

  useEffect(() => {
    if (chooseDef.inGameDefInd > -1 && chooseDef.player.card.name) {
      dispatch(defPlayerAction());
    };
  }, [chooseDef.inGameDefInd, chooseDef.player]);

  useEffect(() => {

    if (inGame.atk.length === 0 && deck.length) {
      if (hands.bot.length < 6) {
        dispatch(giveCardToBot());
      }
      if (hands.player.length < 6) {
        dispatch(giveCardToPlayer());
      }
    }

    if (whoseMove === "player" && inGame.atk.length > 0) {
      dispatch(defBotAction());
    } else if (whoseMove === "bot" && inGame.atk.length === 0) {
      dispatch(atkBotAction());
    }
  }, [inGame.atk.length]);

  return (
    <div className='table'>
      <div className="container">
        <div className="table__deck">
          {
            deck?.map((e, i) => <Card item={e} key={i} isPlayer={false} index={i} isForDef={false} />)
          }
        </div>
        <div className="table__hand opposite-hand">
          {
            hands?.bot?.map((e, i) => <Card item={e} key={i} isPlayer={false} index={i} isForDef={false} />)
          }
        </div>
        <div className="table__hand player-hand">
          {
            hands?.player?.map((e, i) => <Card item={e} key={i} isPlayer={true} index={i} isForDef={false} />)
          }
        </div>
        <div className="table__playground">
          <div className="table__playground_atk">
            {
              inGame.atk?.map((e, i) => <Card item={e} key={i} isPlayer={false} index={i} isForDef={true} />)
            }
          </div>
          <div className="table__playground_def">
            {
              inGame.def?.map((e, i) => <Card item={e} key={i} isPlayer={false} index={i} isForDef={false} />)
            }
          </div>
        </div>
        <div className="table__beaten">
          {
            (whoseMove === "bot" && inGame.atk.length && inGame.atk.length !== inGame.def.length) ? <button onClick={() => dispatch(pickCards())}>Взять</button> : null
          }
          {
            (inGame.atk.length === inGame.def.length && inGame.atk.length !== 0) ? <button onClick={() => dispatch(partEnd())}>Бито</button> : null
          }
        </div>
      </div>
    </div >
  );
};

export default PlayTablePage;