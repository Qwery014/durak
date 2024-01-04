import React, { useEffect, useState } from 'react';
import { typeCard } from '../helpers/consts';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { atkPlayerAction, defCardChoosing, defIndexChoosing, tossCardChoosing } from '../store/cardSlice';
import { getCardSign } from '../helpers/functions';

type CardProps = {
  item: typeCard,
  isPlayer: boolean,
  isForDef: boolean,
  index: number,
};

const Card: React.FC<CardProps> = ({ item, isPlayer, index, isForDef }) => {
  const whoseMove = useSelector((state: RootState) => state.card.whoseMove);
  const inGame = useSelector((state: RootState) => state.card.inGame);
  const chooseDef = useSelector((state: RootState) => state.card.chooseDef);
  const chooseAtk = useSelector((state: RootState) => state.card.chooseAtk);
  const hands = useSelector((state: RootState) => state.card.hands);
  const dispatch = useDispatch();

  const [chosen, setChosen] = useState<boolean>(false);

  useEffect(() => {
    if ((chooseDef.player.index === index || chooseAtk.filter(e => e === index).length) && isPlayer) {
      setChosen(true);
    } else {
      setChosen(false);
    }
  }, [chooseDef.player.index, [...chooseAtk]]);


  function handleClick() {
    if (whoseMove === "bot") {
      // for(let i of chooseDef.player.card)
      if (isPlayer) {
        dispatch(defCardChoosing({ card: item, index }));
      }
      if (isForDef && !inGame.def[index]) {
        dispatch(defIndexChoosing(index));
      }
    }
    if (isPlayer && whoseMove === "player") {
      if (inGame.atk.length === 0) {
        dispatch(atkPlayerAction({ card: item, index }));
      } else if (chooseAtk.filter(e => getCardSign(hands.player[e].name) === getCardSign(item.name)).length) {
        dispatch(tossCardChoosing({
          index: index, toggle: !chosen, needNull: false
        }));
      } else if (!(chooseAtk.filter(e => getCardSign(hands.player[e].name) === getCardSign(item.name)).length)) {
        dispatch(tossCardChoosing({
          index: index, toggle: !chosen, needNull: true
        }));
      }
    }
  }

  return (
    <figure className={`card`} style={{ border: chosen ? "red 3px solid" : "" }} onClick={handleClick}>
      <div className="card-background">
      </div>
      <div className="card-wrapper"
        style={{ color: item.color ? "red" : "black" }}
      >
        {item.name}
      </div>
    </figure>
  );
};

export default Card;