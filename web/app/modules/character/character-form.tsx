import * as React from "react";
import { Control, Form } from "react-redux-form";
import { connect } from "react-redux";
import { getCharacterList } from "./character.actions";

interface ICharacterFormProps {
   onSubmit: () => void;
}

class CharacterForm extends React.Component<ICharacterFormProps> {
  handleSubmit(val: any) {
    // Do anything you want with the form value
    console.log(val);
    fetch("/api/characters/add", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(val)
    })
    .then( () => {
      this.props.onSubmit();
    });
  }

  render() {
    return (
      <Form model="character" onSubmit={(val) => this.handleSubmit(val)}>
        <label>Character Name</label>
        <Control.text model=".name" />
        <button>Submit!</button>
      </Form>
    );
  }
}


///////////////////////////////////
//      Container Component
///////////////////////////////////

const mapStateToProps = () => {
   return {};
};


const mapDispatchToProps = (dispatch: any) => {
   return {
      onSubmit: () => {
         dispatch(getCharacterList());
      },
   };
};

export const CharacterFormContainer: React.ComponentClass<{}> = connect(
  mapStateToProps,
  mapDispatchToProps
)(CharacterForm);