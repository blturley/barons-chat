import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import YouTube from 'react-youtube';
import Api from "./api";
import TokenContext from "./TokenContext";
import { useJwt } from "react-jwt";
import ChatForm from "./ChatForm";
import UserForm from "./UserForm";
import Message from "./Message";
import PlaylistUrl from "./PlaylistUrl";
import ActiveUser from "./ActiveUser";

function Room() {
  const token = useContext(TokenContext);
  const { decodedToken } = useJwt(token);
  const [roomUserData, setRoomUserData] = useState();
  const [roomData, setRoomData] = useState();
  const [userData, setUserData] = useState();
  const [ws, setWs] = useState();
  const [messages, setMessages] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [invalidUrl, setInvalidUrl] = useState(false);
  const [playerActive, setPlayerActive] = useState(false);
  const [userEdit, setUserEdit] = useState(false);
  const { invitelink } = useParams();
  const messagesRef = useRef([]);
  const activeUsersRef = useRef([]);
  const playlistRef = useRef([]);
  const playerRef = useRef([]);
  const pushedButtonRef = useRef(true);
  const wsUrlRef = useRef();
  const closedRef = useRef(false);
  Api.token = token;

  /* ------------------------------------------------------------------------------------------- */

  ///convert base api url into websocket link 
  function alterUrlForWebsocket(baseurl){
    let replacedurl;
    if (baseurl.includes("https")) {
      replacedurl = baseurl.replace("http", "ws");
    } else {
      replacedurl = baseurl.replace("http", "wss");
    }
    return replacedurl + "/chat/";
  }
  ///convert normal url to goofy one player accepts
  function alterYouTubeUrl(normalurl){
    return normalurl.replace("watch?v=", "v/") + "?version=3"
  }
  ///convert normal url to goofy one player accepts for player update
  function alterYouTubeUrlForUpdate(normalurl){
    const videoId = normalurl.substr(normalurl.length - 11);
    return "https://www.youtube.com/v/" + videoId + "?version=3";
  }

  /* ------------------------------------------------------------------------------------------- */

  /// get room and user info
  useEffect(() => {
    async function getData() {
      let room = await Api.getRoomByInvitelink(invitelink);
      let user = await Api.getUserById(decodedToken.id);
      wsUrlRef.current = alterUrlForWebsocket(Api.baseUrl) + `${room.id}`;
      if (!ws) setWs(new WebSocket(wsUrlRef.current));
      setRoomData(room);
      setUserData(user);
    }
    if (decodedToken && !ws) getData();
  }, [decodedToken, invitelink, ws]);

  /// get user's room info
  useEffect(() => {
    async function getRoomUser() {
      let roomuser = await Api.getRoomUser(decodedToken.id, roomData.id);
      if (!roomuser) roomuser = await Api.joinRoom(decodedToken.id, invitelink);
      setRoomUserData(roomuser);
    }
    if (roomData && decodedToken) getRoomUser();
  }, [roomData, invitelink, decodedToken]);

  /* ------------------------------------------------------------------------------------------- */

  /// chat functionality
  useEffect(() => {
    async function addEvents(ws) { 
      ws.addEventListener('message', function(msg) {
        let parsedmsg = JSON.parse(msg.data);
        if (parsedmsg.type === "post") {
          updateMessages(parsedmsg);
        }
        if (parsedmsg.type === "note") {
          updateMessages({text: parsedmsg.text, namecolor: "rgb(50,74,118)", 
          textcolor: "rgb(50,74,118)", nickname: "Alert", font: "default"});
        }
        if (parsedmsg.type === "userinfo") {
          updateActiveUsers(parsedmsg);
        }
        if (parsedmsg.type === "left") {
          removeActiveUser(parsedmsg);
        }
        if (parsedmsg.type === "addurl") {
          addToPlaylist(parsedmsg);
        }
        if (parsedmsg.type === "deleteurl") {
          deleteFromPlaylist(parsedmsg);
        }
        if (parsedmsg.type === "requestplaylist") {
          ws.send(JSON.stringify({ type: "requestplaylist", playlist: playlistRef.current}));
        }
        if (parsedmsg.type === "playlistinfo") {
          updatePlaylist(parsedmsg);
        }
        if (parsedmsg.type === "requestinitplayer") {
          let player = playerRef.current;
          ws.send(JSON.stringify({ type: "initplayerinfo", id: parsedmsg.id, url: player.getVideoUrl(), 
          time: player.getCurrentTime(), state: player.getPlayerState()}));
        }
        if (parsedmsg.type === "playerupdate") {
          pushedButtonRef.current = false;
          updatePlayer(parsedmsg);
        }
        if (parsedmsg.type === "skip") {
        pushedButtonRef.current = false;
        if (playlistRef.current.length <= 0) return;
        let player = playerRef.current;
        let video = playlistRef.current.shift();
        player.loadVideoByUrl({mediaContentUrl:alterYouTubeUrl(video.url)});
        player.seekTo(0);
        setPlaylist([...playlistRef.current]);
        setTimeout(function(){ pushedButtonRef.current = true; }, 1000);
        }
      })
      ws.addEventListener('close', function() {
        if (!roomUserData || !userData || !roomData || closedRef.current) return;
        let newWs = new WebSocket(wsUrlRef.current);
        setWs(newWs);
        setTimeout(function(){ newWs.send(JSON.stringify(
          { type: "rejoin", nickname: roomUserData.nickname, roomid: roomData.id, 
          namecolor: roomUserData.namecolor, userid: roomUserData.userid, avatar: userData.avatar }));
          addEvents(newWs);
        }, 1000);
      })
    }
    async function updateMessages(data) {
      messagesRef.current.push(data)
      setMessages([...messagesRef.current]);
      let chat = document.querySelector('#chat');
      chat.scrollTop = chat.scrollHeight;
    }
    async function updateActiveUsers({nickname, namecolor, userid, avatar}) {
      for (let i=0; i<activeUsersRef.current.length; i++) {
        if (activeUsersRef.current[i].userid === userid) {
          activeUsersRef.current[i] = {nickname, namecolor, userid, avatar};
          setActiveUsers([...activeUsersRef.current]);
          return;
        }
      }
      activeUsersRef.current.push({nickname, namecolor, userid, avatar});
      setActiveUsers([...activeUsersRef.current]);
    }
    async function removeActiveUser({userid}) {
      for (let i=0;i<activeUsersRef.current.length;i++) {
        let user = activeUsersRef.current[i]
        if (user.userid === userid) {
          activeUsersRef.current.splice(i, 1);
          break;
        }
      }
      setActiveUsers([...activeUsersRef.current]);
    }
    async function addToPlaylist({url, id}) {
      let player = playerRef.current;
      playlistRef.current.push({url, id});
      if (playlistRef.current.length === 1 && 
        (player.getVideoUrl() === "https://www.youtube.com/watch" || player.getPlayerState() === 0)) {
        player.loadVideoByUrl({mediaContentUrl:alterYouTubeUrl(url)});
        player.seekTo(0);
        playlistRef.current.pop();
        ws.send(JSON.stringify({ type: "playerupdate", url: player.getVideoUrl(), 
        time: player.getCurrentTime(), state: player.getPlayerState()}));
      }
      setPlaylist([...playlistRef.current]);
    }
    async function updatePlaylist({playlist}) {
      playlistRef.current = [...playlist];
      setPlaylist([...playlistRef.current]);
    }
    async function deleteFromPlaylist({id}) {
      for (let i=0;i<playlistRef.current.length;i++) {
        let url = playlistRef.current[i];
        if (url.id === id) {
          playlistRef.current.splice(i, 1);
          break;
        }       
      }
      setPlaylist([...playlistRef.current]);
    }
    async function updatePlayer(msg) {
      let player = playerRef.current;
      if (msg.url) {
        if (msg.url === "https://www.youtube.com/watch") {
          return;
        }
        player.loadVideoByUrl(alterYouTubeUrlForUpdate(msg.url));
      }
      if (msg.state) {
        if (msg.state === 2 && player.getPlayerState() !== 2) player.pauseVideo();
        if (msg.state === 1 && player.getPlayerState() !== 1) player.playVideo();
      }
      if (msg.time) {
        if (msg.time !== "pause") setTimeout(function(){ player.seekTo(msg.time); }, 500);
      }
      if (msg.state === 2 && msg.time === "pause") {
        pushedButtonRef.current = true;
      } else {
        setTimeout(function(){ pushedButtonRef.current = true; }, 1000);
      }
      
    }
    if (ws && roomUserData && roomData && userData && messagesRef.current.length === 0 && !closedRef.current) {
      addEvents(ws);
    }

  }, [ws, roomUserData, roomData, userData]);

  /// cleanup
  useEffect(() => {
    const cleanup = () => {
      if (ws) {
        closedRef.current = true;
        ws.send(JSON.stringify({ type: "closed" }));
        ws.close();
      }
    }
    /// cleanup if tab closes
    window.addEventListener('beforeunload', cleanup);
    return () => {
      cleanup();
      window.removeEventListener('beforeunload', cleanup);
    }
  }, [ws])

  /* ------------------------------------------------------------------------------------------- */

  /// if required data not yet gathered show "loading"
  if (!roomData || !roomUserData || !ws) {
    return <div style={{textAlign: "center"}}><h1 style={{color: "white"}}>Loading...</h1></div>;
  } else {

    /* ------------------------------------------------------------------------------------------- */

    /// else load chat submit function and render chatroom
    async function submitChat(formData) {
      let {namecolor, textcolor, nickname, font} = roomUserData;
      ws.send(JSON.stringify({ type: "post", namecolor, textcolor, nickname, font, text: formData }))
    }
    async function submitUrl(formData) {
      if (validateYouTubeUrl(formData)) {
        ws.send(JSON.stringify({ type: "addurl", url: formData, id: Math.floor(Math.random() * 5000) }))
      }
    }
    function submitDeleteUrl(id) {
      ws.send(JSON.stringify({ type: "deleteurl", id }))
    }
    async function submitRoomUser(formData) {
      let roomUser = await Api.patchRoomUser(roomData.id, userData.id, formData);
      setRoomUserData(roomUser);
      ws.send(JSON.stringify({ type: "userupdate", nickname: roomUser.nickname, namecolor: roomUser.namecolor }));
      setUserEdit(false);
    }

    /* ------------------------------------------------------------------------------------------- */

    function whenPlayerReady(event) {
      playerRef.current = event.target;
      ws.send(JSON.stringify({ type: "requestinitplayer", id: roomUserData.userid }));
      ws.send(JSON.stringify(
        { type: "join", nickname: roomUserData.nickname, roomid: roomData.id, 
        namecolor: roomUserData.namecolor, userid: roomUserData.userid, avatar: userData.avatar }))
    }
    function whenPlayerPaused(event) {
      setPlayerActive(true);
      if (pushedButtonRef.current) ws.send(JSON.stringify(
        { type: "playerupdate", state: 2, time: "pause" }));
    }
    function whenPlayerPlayed(event) {
      setPlayerActive(true);
      if (pushedButtonRef.current) ws.send(JSON.stringify(
        { type: "playerupdate", state: 1, time: playerRef.current.getCurrentTime()}));
    }
    function whenVideoSkipped(event) {
      if (playlistRef.current.length > 0) ws.send(JSON.stringify({ type: "skip" }));
    }
    function whenPlayerEnd(event) {
      if (playlistRef.current.length > 0) {
        pushedButtonRef.current = false;
        const video = playlistRef.current.shift();
        event.target.loadVideoByUrl({mediaContentUrl:alterYouTubeUrl(video.url)});
        event.target.seekTo(0);
        setPlaylist(playlistRef.current);
        setTimeout(function(){ pushedButtonRef.current = true; }, 1000);
      }
    }

    /* ------------------------------------------------------------------------------------------- */

    /// youtube link validator
    function validateYouTubeUrl(urlcheck){
      if (urlcheck) {
          var regExp = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
          if (urlcheck.match(regExp)) {
            setInvalidUrl(false);      
              return true;
          }
      }
      setInvalidUrl(true);
      return false;
    }

    /* ------------------------------------------------------------------------------------------- */

    return (
      <section>   
        <div className="row">
        <section className="col-3">
          </section >
          <section className="col-6">
            <div id="videoWindow" style={{width:"640px", margin:"auto", position:"relative"}}>
              {!playerActive && <section style={{position:"absolute",width:"640px",height:"366px",top:"0",left:"0"}}></section>}
              <YouTube onReady={whenPlayerReady} onPlay={whenPlayerPlayed} onPause={whenPlayerPaused} onEnd={whenPlayerEnd}/>
            </div>
          </section>
          <section className="col-3 text-center">
          </section>
        </div>
        <br></br>
        <div className="row">
          <section className="col-3 text-center">
          {!userEdit ?
            <div id="activeUserList" style={{backgroundColor:"rgb(216,228,250)", width:"20vw", height:"32vh", margin:"auto", overflowY: "scroll"}}>
              <h4 style={{color:"rgb(50,74,118)"}}>Active Users:</h4>
              <hr></hr>
              {activeUsers && activeUsers.map(user => <ActiveUser user={user} key={user.userid} />)}
            </div>
            :
            <div>
              <UserForm submitForm={submitRoomUser} type="room" user={roomUserData}/>
            </div>}
            <br></br>
            <button className="btn btn-info" onClick={() => setUserEdit(!userEdit)}>
              {!userEdit ? "Customize Your Stuff" : "cancel"}
            </button>
          </section>      
          <section className="col-6">
            <div id="chat" style={{backgroundColor:"rgb(216,228,250)", width:"40vw", height:"20rem", overflowY: "scroll", margin:"auto"}}>
              {messages.map(msg => <Message msg={msg} key={msg.text + `${Math.floor(Math.random() * 5000)}`} />)}
            </div>
            <br></br>
            <ChatForm submitData={submitChat}/>
          </section>
          <section className="col-3 text-center">
            <div id="playlistWindow" style={{backgroundColor:"rgb(216,228,250)", width:"20vw", height:"30vh", margin:"auto", overflowY: "scroll"}}>
              {playlist && playlist.map(val => <PlaylistUrl url={val.url} id={val.id} key={val.id} submitDeleteUrl={submitDeleteUrl}/>)}
            </div>
            {invalidUrl ? <span style={{color:"red"}}>invalid url</span> : <br></br>}
            <ChatForm submitData={submitUrl} placeholderText="add url to playlist" />
            <button style={{margin:"auto"}} className="btn btn-info" onClick={whenVideoSkipped}>Skip Video</button>
          </section>
        </div>
      </section>
    );
  }
}

export default Room;
