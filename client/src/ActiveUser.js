import React from "react";
import DefaultAvatar from './DefaultAvatar.png'

function ActiveUser({ user }) {
  return (
    <span className="pl-2">
      <span style={{color:user.namecolor}}><img style={{width:"50px"}} src={user.avatar === "default" ? DefaultAvatar : user.avatar} />   {user.nickname}</span>
      <br></br>
    </span>
  );
}

export default ActiveUser;
