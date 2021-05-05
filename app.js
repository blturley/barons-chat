"use strict";
/// import express
const express = require("express");
const cors = require("cors");
/// set express app and websockets
const app = express();
const expressWs = require('express-ws')(app);
/// import 404 expressError
const { NotFoundError } = require("./expressError");
/// request logger
const morgan = require("morgan");
/// JWT authentication
const { authenticateJWT } = require("./middleware/auth");
// import routes
const authRoutes = require("./routes/auth");
const roomsRoutes = require("./routes/rooms");
const usersRoutes = require("./routes/users");
const roomusersRoutes = require("./routes/roomusers");

/// use middleware
app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
app.use(authenticateJWT);

/// use routes
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/roomusers", roomusersRoutes);

/// websockets path
app.ws('/api/chat/:id', function(ws, req) {
  ws.on('message', function(data) {
    try {
      let msg = JSON.parse(data);
      if (msg.type === "post") {
        const {nickname, namecolor, textcolor, text, font} = msg;
        expressWs.getWss().clients.forEach(function(client) {
          if (client.roomid == req.params.id && client.readystate === expressWs.OPEN) {
            client.send(JSON.stringify({type:"post", nickname, namecolor, textcolor, text, font}));
          }
        })
      }
      else if (msg.type === "addurl") {
        expressWs.getWss().clients.forEach(function(client) {
          if (client.roomid == req.params.id && client.readystate === expressWs.OPEN) {
            client.send(JSON.stringify(msg));
          }
        })
      }
      else if (msg.type === "deleteurl") {
        expressWs.getWss().clients.forEach(function(client) {
          if (client.roomid == req.params.id && client.readystate === expressWs.OPEN) {
            client.send(JSON.stringify(msg));
          }
        })
      }
      else if (msg.type === "requestplaylist") {
        expressWs.getWss().clients.forEach(function(client) {
          if (client.roomid == req.params.id && client.readystate === expressWs.OPEN) {
            client.send(JSON.stringify({type: "playlistinfo", playlist: msg.playlist}));
          }
        })
      }
      else if (msg.type === "requestinitplayer") {
        let clientlist = []
        expressWs.getWss().clients.forEach(function(client) {
          if (client.roomid == req.params.id && client.readystate === expressWs.OPEN) clientlist.push(client);
        })
        for (let client of clientlist) {
          if (client.roomid == req.params.id && client.readystate === expressWs.OPEN && client.userid !== ws.userid) {
            client.send(JSON.stringify(msg));
            break;
          }
        }
      }
      else if (msg.type === "initplayerinfo") {
        let clientlist = []
        expressWs.getWss().clients.forEach(function(client) {
          if (client.roomid == req.params.id && client.readystate === expressWs.OPEN) clientlist.push(client);
        })
        for (let client of clientlist) {
          if (client.roomid == req.params.id && client.readystate === expressWs.OPEN && client.userid === msg.id) {
            msg.type = "playerupdate";
            msg.clientid = client.userid;
            client.send(JSON.stringify(msg));
            break;
          }
        }
      }
      else if (msg.type === "playerupdate" || msg.type === "skip") {
        for (let client of expressWs.getWss().clients) {
          if (client.roomid == req.params.id && client.readystate === expressWs.OPEN) {          
            client.send(JSON.stringify(msg));
          }
        }
      }
      else if (msg.type === "userupdate") {
        ws.nickname = msg.nickname;
        ws.namecolor = msg.namecolor;
        for (let client of expressWs.getWss().clients) {
          if (client.roomid == req.params.id && client.readystate === expressWs.OPEN) {
            client.send(JSON.stringify(
              {type: 'userinfo', nickname: ws.nickname, namecolor: ws.namecolor, userid: ws.userid, avatar: ws.avatar}));
          }
        }
      }
      else if (msg.type === 'join'){
        ws.roomid = msg.roomid;
        ws.nickname = msg.nickname;
        ws.namecolor = msg.namecolor; 
        ws.userid = msg.userid;
        ws.avatar = msg.avatar;
        let clientlist = []
        expressWs.getWss().clients.forEach(function(client) {
          if (client.roomid == req.params.id && client.readystate === expressWs.OPEN) clientlist.push(client);
        })
        /// broadcast join notification
        clientlist.forEach(function(client) {
          client.send(JSON.stringify({type: 'note', text: `${msg.nickname} has entered`}));
        }) 
        /// send playlist request to single user
        for (let client of clientlist) {
          if (client.userid !== ws.userid) {
            client.send(JSON.stringify({type: 'requestplaylist'}));
            break;
          }         
        }
        /// get all active users info and broadcast it
        clientlist.forEach(function(client) {
          for (let c of clientlist) {
            c.send(JSON.stringify(
              {type: 'userinfo', nickname: client.nickname, namecolor: client.namecolor, userid: client.userid, avatar: client.avatar}));
          }
        })     
      }
    } catch (err) {
      console.error(err);
    }
  }); 
  ws.on('close', function() {
    try {
      expressWs.getWss().clients.forEach(function(client) {
          if (client.roomid == req.params.id && client.readystate === expressWs.OPEN) {
            client.send(JSON.stringify({type: 'note', text: `${ws.nickname} has left`}));
            client.send(JSON.stringify({type: 'left', userid: ws.userid})); 
          }
        })
    } catch (err) {
      console.error(err);
    }
  });
})




const path = require('path')
// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, 'client/build')))
// Anything that doesn't match the above, send back index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/build/index.html'))
})






/// 404 handler
app.use(function (req, res, next) {
  return next(new NotFoundError());
});

/// other error handler
app.use(function (err, req, res, next) {
  const status = err.status || 500;
  const message = err.message;
  return res.status(status).json({
    error: { message, status },
  });
});

module.exports = app;
