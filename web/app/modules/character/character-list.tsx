import * as React from "react";
import { Control, Form } from "react-redux-form";
import { connect } from "react-redux";
import { getCharacterList } from "./character.actions";

interface ICharacterListProps {
   list: any[];
}

const CharacterList = (props: ICharacterListProps) =>
{
   var characters = props.list.map( (character: any) => {
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

///////////////////////////////////
//      Container Component
///////////////////////////////////

const mapDispatchToProps = () => {};

const mapStateToProps = (state: any) => {
  return {...state.characters };
}

export const CharacterListContainer: React.ComponentClass<{}> = connect(
  mapStateToProps,
  mapDispatchToProps
)(CharacterList);