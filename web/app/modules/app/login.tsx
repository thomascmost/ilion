import * as React from "react";
import { Link } from "react-router-dom";
import { Form, Control } from "react-redux-form";
const styles = require('./login.scss');


export class LoginPage extends React.Component {
   handleSubmit(val: any) {
      fetch("/api/sessions/login", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(val)
      })
      // .then( () => {
      //   this.props.onSubmit();
      // });
   }
   render () {
      return <div className={styles.container}>
         <form className="login-form">
            <Form model="login" onSubmit={(val) => this.handleSubmit(val)}>
               <label>Enter your Passkey</label>
               <Control.text model=".password" />
               <button>Log In</button>
            </Form>
         </form>
      </div>;
   }
}
