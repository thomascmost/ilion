import * as React from "react";
import Character from "server/models/character.model";
const styles = require('./character-card.scss');

interface ICharacterCardProps {
   character: Character;
}

export const CharacterCard = (props: ICharacterCardProps) =>
   <div className={styles.container}>
      <label>{props.character.name}</label>
   </div>
