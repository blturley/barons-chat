import React, { useState, useEffect, useContext} from "react";
import RoomPreview from "./RoomPreview"
import ChatForm from "./ChatForm"
import Api from "./api";
import TokenContext from "./TokenContext";

function UserRooms({ id, withCreate=false }) {
  const token = useContext(TokenContext);
  const [rooms, setRooms] = useState();
  Api.token = token;

  async function getRooms() {
    let res = await Api.getUserRooms(id);
    let owned = res.isowner.sort(function(a, b) {
      return a.id - b.id;
    });
    let member = res.ismember.sort(function(a, b) {
      return a.id - b.id;
    });
    setRooms({ismember:member,isowner:owned});
  }
  async function createRoom(formData) {
    await Api.createRoom(formData);
    getRooms();
  }

  useEffect(() => {
    getRooms();
  }, []);


  if (!rooms) {
    return <div style={{textAlign: "center"}}><h1 style={{color: "white"}}>Loading...</h1></div>;
  }

  return (
    <section>
      {withCreate && 
      <div>
        <h3>Create Room</h3>
        <span style={{width:"300px"}}>
          <ChatForm submitData={createRoom} placeholderText="Room Name" />
        </span>
        <br></br>
      </div>
      }
      <h2>Rooms</h2>
      <div className="row my-1" style={{width:"50%", margin:"auto"}}>
        <div className="col-md m-3 p-2" style={{boxShadow:"0px 0px 8px black"}}>
          <h3>owned:</h3>
          <hr style={{height:"1px", backgroundColor:"white"}}></hr>
          {rooms.isowner.map(room => <RoomPreview room={room} isowner={true} getRooms={getRooms} userid={id}/>)}
        </div>
        <div className="col-md m-3 p-2" style={{boxShadow:"0px 0px 10px black"}}>
          <h3>member of:</h3>
          <hr style={{height:"1px", backgroundColor:"white"}}></hr>
          {rooms.ismember.map(room => <RoomPreview room={room} isowner={false} getRooms={getRooms} userid={id}/>)}
        </div>
      </div>
    </section>
  );
}

export default UserRooms;
