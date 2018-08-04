import * as React from "react";
import { Control, Form } from "react-redux-form";

interface ICharacterListProps {
   characters: any[];
}

const CharacterList = (props: ICharacterListProps) =>
{
   var characters = this.props.characters.map( (character: any) => {
         return (
            <div>
               {character.name}
            </div>
      );
   });
   return (
      <div>
         {characters}
      </div>
   );
};

export default CharacterList;