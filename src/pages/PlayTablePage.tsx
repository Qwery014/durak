import React, { useEffect } from 'react';

import "../styles/PlayTablePage.scss";
import Card from '../components/Card';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { atkBotAction, deckShuffling, defBotAction, defPlayerAction, defineQueue, giveCardToBot, giveCardToPlayer, partEnd, pickCards, reversePlayerMove, tossCardPlayer } from '../store/cardSlice';
import { getCardSign } from '../helpers/functions';



const PlayTablePage: React.FC = () => {

  const inGame = useSelector((state: RootState) => state.card.inGame);
  const hands = useSelector((state: RootState) => state.card.hands);
  const deck = useSelector((state: RootState) => state.card.deck);
  const whoseMove = useSelector((state: RootState) => state.card.whoseMove);
  const chooseDef = useSelector((state: RootState) => state.card.chooseDef);
  const chooseAtk = useSelector((state: RootState) => state.card.chooseAtk);
  const dispatch = useDispatch();

  function canPlayerAddCard(): boolean {
    const isChoose = chooseAtk.length > 0;
    const isPlayer = whoseMove === "player";
    const atkLength = inGame.atk.length > 0 && inGame.atk.length < 6;

    function isSuitable(): boolean {
      const res: boolean[] = [];
      if (inGame.atk.length >= 6) return false;

      for (let i in inGame.atk) {
        for (let j in chooseAtk) {
          if (
            getCardSign(inGame.def[i].name) === getCardSign(hands.player[chooseAtk[j]].name) ||
            getCardSign(inGame.atk[i].name) === getCardSign(hands.player[chooseAtk[j]].name)
          ) {
            res.push(true);
          } else {
            res.push(false);
          }
        }
      }
      return res.some(e => e);
    }

    return (isChoose && isPlayer && atkLength && isSuitable());
  }


  function canPlayerReverse(): boolean {
    const isChoose: boolean = chooseDef.player.card.name !== "";
    const isBotMove: boolean = whoseMove === "bot";
    const isDefNull: boolean = !Boolean(inGame.def.length);

    function isReverseble(): boolean {
      if (inGame.atk.length &&
        (getCardSign(inGame.atk[0].name) === getCardSign(chooseDef.player.card.name))
      ) {
        return true;
      } else {
        return false
      }
    };

    return (isChoose && isBotMove && isDefNull && isReverseble());
  }



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
  }, [inGame.atk.length, whoseMove]);

  return (
    <div className='table'>
      <div className="container">
        <div className="table__deck">
          {
            deck?.map((e, i) => <Card item={e} key={i} isPlayer={false} index={i} isForDef={false} />)
          }
        </div>
        <div className="table__whoseMove">
          {whoseMove}
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
            {
              canPlayerAddCard() ?
                <figure className={`card-add`} onClick={() => dispatch(tossCardPlayer())}>
                  <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" viewBox="0 0 45.402 45.402" xmlSpace="preserve">
                    <g>
                      <path d="M41.267,18.557H26.832V4.134C26.832,1.851,24.99,0,22.707,0c-2.283,0-4.124,1.851-4.124,4.135v14.432H4.141   c-2.283,0-4.139,1.851-4.138,4.135c-0.001,1.141,0.46,2.187,1.207,2.934c0.748,0.749,1.78,1.222,2.92,1.222h14.453V41.27   c0,1.142,0.453,2.176,1.201,2.922c0.748,0.748,1.777,1.211,2.919,1.211c2.282,0,4.129-1.851,4.129-4.133V26.857h14.435   c2.283,0,4.134-1.867,4.133-4.15C45.399,20.425,43.548,18.557,41.267,18.557z" />
                    </g>
                  </svg>
                </figure> : null
            }
            {
              canPlayerReverse() ?
                <figure className={`card__move-reverse`} onClick={() => dispatch(reversePlayerMove())}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" >
                    <path d="M12.0789 2.25C7.2854 2.25 3.34478 5.913 2.96055 10.5833H2.00002C1.69614 10.5833 1.42229 10.7667 1.30655 11.0477C1.19081 11.3287 1.25606 11.6517 1.47178 11.8657L3.15159 13.5324C3.444 13.8225 3.91567 13.8225 4.20808 13.5324L5.88789 11.8657C6.10361 11.6517 6.16886 11.3287 6.05312 11.0477C5.93738 10.7667 5.66353 10.5833 5.35965 10.5833H4.4668C4.84652 6.75167 8.10479 3.75 12.0789 3.75C14.8484 3.75 17.2727 5.20845 18.6156 7.39279C18.8325 7.74565 19.2944 7.85585 19.6473 7.63892C20.0002 7.42199 20.1104 6.96007 19.8934 6.60721C18.2871 3.99427 15.3873 2.25 12.0789 2.25Z" />
                    <path d="M20.8412 10.4666C20.5491 10.1778 20.0789 10.1778 19.7868 10.4666L18.1005 12.1333C17.8842 12.3471 17.8185 12.6703 17.934 12.9517C18.0496 13.233 18.3236 13.4167 18.6278 13.4167H19.5269C19.1456 17.2462 15.876 20.25 11.8828 20.25C9.10034 20.25 6.66595 18.7903 5.31804 16.6061C5.10051 16.2536 4.63841 16.1442 4.28591 16.3618C3.93342 16.5793 3.82401 17.0414 4.04154 17.3939C5.65416 20.007 8.56414 21.75 11.8828 21.75C16.6907 21.75 20.6476 18.0892 21.0332 13.4167H22.0002C22.3044 13.4167 22.5784 13.233 22.694 12.9517C22.8096 12.6703 22.7438 12.3471 22.5275 12.1333L20.8412 10.4666Z" />
                  </svg>
                </figure> : null
            }
          </div>
          <div className="table__playground_def">
            {
              inGame.def?.map((e, i) => <Card item={e} key={i} isPlayer={false} index={i} isForDef={false} />)
            }
            {
              canPlayerAddCard() ? <div></div> : null
            }
            {
              canPlayerReverse() ? <div></div> : null
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