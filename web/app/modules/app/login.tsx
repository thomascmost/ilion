import * as React from "react";
import { Link } from "react-router-dom";
const styles = require('./login.scss');


export const LoginPage = () => {
      return <div className={styles.container}>
         <form className="login-form">
            <label>Enter your Passkey</label>
            <input type="password" />
            <Link to="/i">
               <button>Log In</button>
            </Link>
         </form>
      </div>;
   }
