import * as React from "react";
import { CharacterFormContainer } from "../character/character-form";
import { CharacterListContainer } from "../character/character-list";

export const Home = () => {
      return <div>
         <h3>Three Sisters</h3>
         <CharacterFormContainer />
         <CharacterListContainer />
      </div>;
   }
