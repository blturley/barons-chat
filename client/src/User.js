import React, { useState, useEffect, useContext} from "react";
import UserForm from "./UserForm"
import UserRooms from "./UserRooms"
import { Link } from "react-router-dom"
import Api from "./api";
import TokenContext from "./TokenContext";
import { useJwt } from "react-jwt";
import DefaultAvatar from './DefaultAvatar.png'

function User({ submitForm }) {
  const token = useContext(TokenContext);
  const { decodedToken } = useJwt(token);
  const [userData, setUserData] = useState();
  const [edit, setEdit] = useState(false);
  const [invalidUrl, setInvalidUrl] = useState(false);
  Api.token = token;

  async function getUserData(id) {
    let user = await Api.getUserById(id);
    setUserData(user);
  }

  useEffect(() => {
    if (decodedToken) getUserData(decodedToken.id);
  }, [decodedToken]);

  async function submitAndUpdate(formData) {
    if (!validateUrl(formData.avatar)) formData.avatar = "default";
    submitForm(formData, "update", decodedToken.id);
    getUserData(decodedToken.id);
    setEdit(!edit);
  }

  function validateUrl(urlcheck){
    if (urlcheck) {
        var regExp = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
        if (urlcheck.match(regExp) || urlcheck === "default") {
          setInvalidUrl(false);
          return true;
        }
    }
    setInvalidUrl(true);
    return false;
  }

  if (!userData) {
    return <div style={{textAlign: "center"}}><h1 style={{color: "white"}}>Loading...</h1></div>;
  }

  return (
    <section className="text-center">
      {!edit &&
      <span>
      <h1>Account</h1>
      <h3>Username: {userData.username}</h3> 
      {userData.avatar === 'default' ? 
      <img src={DefaultAvatar} style={{width:"100px"}}/> : 
      <img src={userData.avatar} style={{width:"100px"}}/>}
      <h3>Email: {userData.email}</h3>
      <button className="btn btn-info btn-sm mx-1" onClick={() => setEdit(!edit)}>Edit</button>
      {invalidUrl && <span style={{color:"red"}}>
        <br></br>
        Invalid URL</span>}
      </span>
      }
      {edit && 
      <span>
      <UserForm type="update" submitForm={submitAndUpdate} user={userData} />
      <button className="btn btn-warning btn-sm mx-1" onClick={() => setEdit(!edit)}>Cancel</button>
      </span>
      }
      <hr style={{backgroundColor:"white"}}></hr>
      <UserRooms id={decodedToken.id} />
      <br></br>
      <h4>Go back to <Link to="/">Home Page</Link></h4>
      <br></br>
    </section>
  );
}

export default User;
