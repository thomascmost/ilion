import * as React from "react";
import CharacterForm from "web/app/modules/character/character-form";
import CharacterList from "web/app/modules/character/character-list";

export const Home = () => {
      return <div>
         <CharacterForm />
         <CharacterList characters={[]} />
      </div>;
   }
