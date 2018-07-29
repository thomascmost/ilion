import * as React from "react";
import { Control, Form } from "react-redux-form";

export default class CharacterForm extends React.Component {
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