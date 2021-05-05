import React from "react";

function Message({ msg }) {
  return (
    <span>
      <p className="mx-3 pt-2"><span style={{color:msg.namecolor}}>{msg.nickname}:   </span><span style={{color:msg.textcolor}}>{msg.text}</span></p>
    <hr className="m-0"></hr>
    </span>
  );
}

export default Message;
