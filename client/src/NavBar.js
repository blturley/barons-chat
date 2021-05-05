import React, { useContext } from "react";
import "./NavBar.css";
import { NavLink } from "react-router-dom";
import { Navbar, Nav, NavItem } from "reactstrap";
import TokenContext from "./TokenContext"

function NavBar() {
  const token = useContext(TokenContext);

  return (
    <div>
      <Navbar expand="md">
        <NavLink exact to="/" className="navbar-brand">
          <b>BC</b>🗯
        </NavLink>
        { token ?
        <Nav className="ml-auto">
          <NavItem>
            <NavLink to="/myaccount">Account</NavLink>
          </NavItem>
          <NavItem>
            <NavLink to="/logout">log out</NavLink>
          </NavItem>
        </Nav>
        :
        <Nav className="ml-auto">
          <NavItem>
            <NavLink to="/signup">sign up</NavLink>
          </NavItem>
        </Nav>
        }
      </Navbar>
    </div>
  );
}

export default NavBar;
