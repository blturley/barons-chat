import React from "react";
import UserForm from "./UserForm";
import splashLogo from './bclogo02.png';
import { Link } from "react-router-dom";

function Login({ submitForm }) {

  return (
    <section style={{textAlign: "center"}}>
    <img src={splashLogo} style={{width: "30%"}} />
    <br></br>
    <br></br>
    <UserForm type="login" submitForm={submitForm}/>
    <br></br>
    <br></br>
    <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
    </section>
  );
}

export default Login;
