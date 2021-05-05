import React, { useState } from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import Home from "./Home";
import Login from "./Login";
import NavBar from "./NavBar";
import Room from "./Room";
import User from "./User";
import UserForm from "./UserForm";
import LogOut from "./LogOut";
import Api from "./api";
import TokenContext from "./TokenContext";
import StyleContext from "./StyleContext";
/// css
import "./bootstrap-grid.css";
import "./bootstrap-reboot.css";
import "./bootstrap.css";
import "./App.css";

function App() {
  const [token, setToken] = useState("");
  const [style, setStyle] = useState("default");

  async function submitForm(formData, type, userid){
      let res;
      if (type === "login") res = await Api.loginUser(formData); 
      if (type === "signup") res = await Api.registerUser(formData);
      if (type === "update") res = await Api.patchUser(userid, formData);
      if (res && type !== "update") {
        setToken(res);
        window.localStorage.setItem("authorization", res) 
      }
  };

  function logOut() {
    setToken("");
    window.localStorage.removeItem("authorization");
  }

  if (!token && window.localStorage.getItem("authorization")) setToken(window.localStorage.getItem("authorization"))

  return (
    <TokenContext.Provider value={token}>
    <StyleContext.Provider value={style}>
      <div className="App">
        <NavBar />
        {token ?
        <main>
          <Switch>
            <Route exact path="/">
              <Home />
            </Route>
            <Route exact path="/myaccount">
              <User submitForm={submitForm}/>
            </Route>
            <Route exact path="/room/:invitelink">
              <Room />
            </Route>
            <Route exact path="/logout">
              <LogOut logOut={logOut}/>
            </Route>
            <Route>
              <Redirect to="/" />
            </Route>
          </Switch>
        </main>
        :
        <main>
          <Route exact path="/">
            <Redirect to="/login" />
          </Route>
          <Route exact path="/login">
              <Login submitForm={submitForm}/>
          </Route>
          <Route exact path="/signup">
            <UserForm type="signup" submitForm={submitForm}/>
          </Route>
          <Route>
            <Redirect to="/login" />
          </Route>
        </main>
        }
      </div>
    </StyleContext.Provider>
    </TokenContext.Provider>
  );
}

export default App;
