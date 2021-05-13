import React, { useState, useEffect, useContext} from "react";
import UserRooms from "./UserRooms"
import Api from "./api";
import TokenContext from "./TokenContext";
import { Link } from "react-router-dom"
import { useJwt } from "react-jwt";
import DefaultAvatar from './DefaultAvatar.png'

function Home() {
  const token = useContext(TokenContext);
  const { decodedToken } = useJwt(token);
  const [userData, setUserData] = useState();
  Api.token = token;

  async function getUserData(id) {
    let user = await Api.getUserById(id);
    setUserData(user);
  }

  useEffect(() => {
    if (decodedToken) getUserData(decodedToken.id);
  }, [decodedToken]);

  if (!decodedToken || !userData) {
    return <div style={{textAlign: "center"}}><h1 style={{color: "white"}}>Loading...</h1></div>;
  }

  return (
    <section className="text-center" style={{width:"100%"}}>
      {userData.avatar === 'default' ? 
      <img src={DefaultAvatar} style={{width:"100px"}}/> : 
      <img src={userData.avatar} style={{width:"100px"}}/>
      }
      <br></br>
      <h1>{userData.username}</h1>
      <Link to="/myaccount">Edit Profile</Link>
      <hr style={{backgroundColor:"white"}}></hr>
      <UserRooms id={decodedToken.id} withCreate={true} />
      <br></br>
    </section>
  );
}

export default Home;
