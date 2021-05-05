import React from "react";
import { useHistory } from "react-router-dom"

function LogOut({ logOut }) {
  const history = useHistory();

  function handleLogout() {
    logOut();
    history.push("/login");
  }
  handleLogout();

  return <></>;
}
export default LogOut;
