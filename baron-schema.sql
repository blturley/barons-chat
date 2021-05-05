CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(30) NOT NULL UNIQUE,
  password VARCHAR(100),
  email VARCHAR(100) NOT NULL UNIQUE 
    CHECK (position('@' IN email) > 1),
  avatar VARCHAR(500) NOT NULL DEFAULT 'default',
  isjanie VARCHAR(5) NOT NULL DEFAULT 'false'
);

CREATE TABLE rooms (
  id SERIAL PRIMARY KEY,
  roomname VARCHAR(100) NOT NULL UNIQUE,
  roomowner INTEGER
    REFERENCES users (id) ON DELETE CASCADE,
  isprivate VARCHAR(5) NOT NULL DEFAULT 'true',
  style VARCHAR(30) NOT NULL DEFAULT 'default',
  font VARCHAR(50) NOT NULL DEFAULT 'default',
  background VARCHAR(500) NOT NULL DEFAULT 'default',
  thumbnail VARCHAR(500) NOT NULL DEFAULT 'default',
  invitelink VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE room_users (
  userid INTEGER NOT NULL,
  roomid INTEGER NOT NULL,
  nickname VARCHAR(50),
  namecolor VARCHAR(50) NOT NULL DEFAULT 'black',
  textcolor VARCHAR(50) NOT NULL DEFAULT 'black',
  font VARCHAR(50) NOT NULL DEFAULT 'default',
  isadmin VARCHAR(5) NOT NULL DEFAULT 'false',
  isbanned VARCHAR(5) NOT NULL DEFAULT 'false',
  FOREIGN KEY (userid) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (roomid) REFERENCES rooms (id) ON DELETE CASCADE,
  PRIMARY KEY (userid, roomid)
);

CREATE TABLE notifications (
  userid INTEGER NOT NULL,
  roomid INTEGER NOT NULL,
  style VARCHAR(30) NOT NULL DEFAULT 'invite',
  FOREIGN KEY (userid) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (roomid) REFERENCES rooms (id) ON DELETE CASCADE,
  PRIMARY KEY (userid, roomid)
);

