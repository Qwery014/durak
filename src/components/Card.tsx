import React, { useEffect, useState } from 'react';
import { typeCard } from '../helpers/consts';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { atkPlayerAction, defCardChoosing, defIndexChoosing } from '../store/cardSlice';

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
  const dispatch = useDispatch();

  const [chosen, setChosen] = useState<boolean>(false);

  useEffect(() => {
    if (chooseDef.player.index === index && isPlayer) {
      setChosen(true);
    } else {
      setChosen(false);
    }
  }, [chooseDef.player.index]);

  function handleClick() {
    if (whoseMove === "bot") {
      if (isPlayer) {
        dispatch(defCardChoosing({ card: item, index }));
      }
      if (isForDef && !inGame.def[index]) {
        dispatch(defIndexChoosing(index));
      }
    }
    if (isPlayer && whoseMove === "player") {
      dispatch(atkPlayerAction({ card: item, index }));
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