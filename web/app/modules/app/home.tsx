import * as React from "react";
import { CharacterFormContainer } from "web/app/modules/character/character-form";
import { CharacterListContainer } from "web/app/modules/character/character-list";

export const Home = () => {
      return <div>
         <CharacterFormContainer />
         <CharacterListContainer />
      </div>;
   }
