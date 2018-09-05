import * as React from "react";
import { CharacterFormContainer } from "./character-form";
import { CharacterListContainer } from "./character-list";
const styles = require('./character-page.scss');


export const CharacterPage = () => {
      return <div className={styles.container}>
         <CharacterFormContainer />
         <CharacterListContainer />
      </div>;
   }
