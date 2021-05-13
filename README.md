### Welcome to
# Baron's Chat
#### Prototype build

**Deployed version of app can be found [here](https://baronschat.herokuapp.com/)**

## *What is Barons's Chat?*

Baron's Chat is a websocket based chat application where users can create and join chatrooms that feature real time text chat as well as the ability to sync up youtube videos between users using an embedded iframe player. It's watching online videos with friends!

## *What are the key features?*

- Custom username and avatar
- Custom roomname and username color
- custom room names and room thumbnails
- Quick and easy creation of rooms
- Sharing and accessing private rooms using invite links
- video playlists for adding and queueing videos for autoplay
- video sync throughout chatroom for simultaneous viewing
- in-chat list of active chat room users
- easy and secure sign-up and login

## *How do you use the app?*

Using it easy. Just sign up for an account using a username, password, and email. Rooms can be created, customized, and entered on the homepage and user infor can be edited using the account page. Invite links are listed under the room thumbnails and are used to access rooms. Once accessed through the link the room will be listed under the users "member" list until the user decides to leave, which simply delists the room for the user. Valid Youtube urls can be added using the playlist input and removed using the X icons. User's room nickname and color can be edited using the button under the active users window. Want to stop the video or skip ahead? Want to skip to the next video entirely? All this will happen for the other users as well as everything down to the time in the video is synced up using the power of websockets.

## *What was used to make it?*

- Node.js
- React
- Express.js
- Express-ws
- React-Router
- Youtube API and iframe player
- React-Youtube
- bcrypt
- jsonschema
- jwts
- bootstrap
- reactstrap
- axios

## *How is the app structured?*

Baron's Chat uses a node.js and express backend with a postgresql database. The Models for interact with the database and routes utilize the models. websocket routing is handled in the app file. The frontend is a react app that sends requests to the backend through the api file. websockets are connected to when a user enters a room and closed when users leave. Messages are not submitted to the database so chat can only be seen starting from the time the user enters the room. Rooms use react-youtube to help with iframe player interface event listeners are used to send data to the websockets whenever the player is interacted with.

## *How do I run it locally?*

If you want to set up your own front and back end the app can be run locally using concurrently to run both ends on the same terminal. The backend is set up to run on port 3001 while the front should be ran on 3000. Before starting You must run the baron.sql file to make a databse and the BASE_URL variable in the api.js file for the react fontend in the client folder must be changed to "http://localhost:3001/api" for proper api interaction if it isn't set to that already. After the dependencies are installed and all the requirements are met use "npm run dev" in the root folder to launch.