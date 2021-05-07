import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import RoomForm from "./RoomForm"
import DefaultThumb from './DefaultThumb.png'
import TokenContext from "./TokenContext";
import Api from "./api";

function User({ room, isowner, getRooms, userid }) {
  const [deletebtn, setDeletebtn] = useState(false);
  const [editbtn, setEditbtn] = useState(false);
  const [leavebtn, setLeavebtn] = useState(false);
  const [invalidUrl, setInvalidUrl] = useState(false);
  const token = useContext(TokenContext);
  Api.token = token;

  async function submitEdit(formData) {
    if (!validateUrl(formData.thumbnail)) formData.thumbnail = "default";
    await Api.patchRoom(room.id, formData);
    getRooms();
    setEditbtn(!editbtn);
  } 
  async function submitDelete() {
    await Api.deleteRoom(room.id);
    getRooms();
    setDeletebtn(!deletebtn);
  } 
  async function submitLeave() {
    await Api.leaveRoom(userid, room.id);
    getRooms();
    setLeavebtn(!leavebtn);
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

  return (
    <section className="my-4">
      {room.thumbnail === 'default' ? 
      <img src={DefaultThumb} style={{width:"200px"}}/> : 
      <img src={room.thumbnail} style={{width:"200px"}}/>}
      <h3><Link to={`/room/${room.invitelink}`}>{room.roomname}</Link></h3>
      <p>Invite Link: <span style={{color:"black", backgroundColor:"white"}}>
        {Api.baseUrl === "http://localhost:3001/api" || Api.baseUrl === "https://localhost:3001/api" ? 
        Api.baseUrl.substring(0, Api.baseUrl.length - 5) + "0/room/" + room.invitelink :
        Api.baseUrl.substring(0, Api.baseUrl.length - 4) + "/room/" + room.invitelink}</span></p>
      {!isowner &&
      <div>
        {!leavebtn && <button onClick={()=>setLeavebtn(!leavebtn)} className="btn btn-danger btn-sm">Leave room</button>}
        {leavebtn && 
          <span> Are you sure? 
            <button onClick={submitLeave} className="btn btn-danger btn-sm mx-1">Leave room</button>
            <button onClick={()=>setLeavebtn(!leavebtn)} className="btn btn-warning btn-sm mx-1">Cancel</button>
          </span>
         }
      </div>
      }
      {isowner && 
      <div>
        {(!deletebtn && !editbtn) &&
        <span>
          <button onClick={()=>setDeletebtn(!deletebtn)} className="btn btn-danger btn-sm mx-1">Delete room</button>
          <button onClick={()=>setEditbtn(!editbtn)} className="btn btn-info btn-sm mx-1">Edit room</button>
          <br></br>
        </span>
        }
        {deletebtn && 
        <span>Are you sure? 
          <button onClick={submitDelete} className="btn btn-danger btn-sm mx-1">Yes</button>
          <button onClick={()=>setDeletebtn(!deletebtn)} className="btn btn-warning btn-sm mx-1">Cancel</button>
        </span>
        }
        {editbtn && 
        <span>
          <RoomForm submitForm={submitEdit} room={room} />
          <button onClick={()=>setEditbtn(!editbtn)} className="btn btn-warning btn-sm">Cancel</button>
        </span>
        }
        {invalidUrl && <span style={{color:"red"}}>Invalid URL</span>}
      </div>
      }
    </section>
  );
}

export default User;
