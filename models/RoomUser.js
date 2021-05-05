"use strict";
const db = require("../db");
const { NotFoundError} = require("../expressError");

class RoomUser {

  /// add user to room
  static async joinRoom(userid, roomid) {
    const res = await db.query(
      `SELECT u.username, r.id 
      FROM users u CROSS JOIN rooms r 
      WHERE u.id = $1 AND r.id = $2`, 
      [userid, roomid]);
    const rows = res.rows[0];
    /// if no user or room throw error
    if (!rows) throw new NotFoundError(`Invalid user or room ID`);
    /// insert into database
    const userInfo = await db.query(`INSERT INTO room_users 
                (userid, roomid, nickname) 
                VALUES ($1, $2, $3)
                RETURNING *`,
                [userid, roomid, rows.username]);
    return userInfo.rows[0];
  }


  /// get full list of usernames for room
  static async getUsersList(roomid) {
    const res = await db.query(
      `SELECT u.username
      FROM users u RIGHT JOIN room_users r 
      ON u.id = r.userid  
      WHERE r.roomid = $1`, 
      [roomid]);
    return res.rows.map(user => user.username);
  }


  /// get specific user info for room
  static async getRoomUser(userid, roomid) {
    const res = await db.query(
      `SELECT *
      FROM room_users  
      WHERE roomid = $1 AND userid = $2`, 
      [roomid, userid]);
    return res.rows[0];
  }


  /// Update user's room info with data
  static async update(userid, roomid, data) {
    /// id included in update delete it
    if (data.userid) delete data.userid;
    if (data.roomid) delete data.roomid;
    /// get arrays of keys and values from data
    const keys = Object.keys(data);
    const values = Object.values(data);
    /// make sql strings out of keys
    const cols = keys.map((name, idx) =>
      `"${name}"=$${idx + 1}`,
    );
    /// make sql out of id and it's index
    const useridIdx = "$" + (values.length + 1);
    const roomidIdx = "$" + (values.length + 2);
    /// make sql query out of strings and columns
    const query = `UPDATE room_users 
                      SET ${cols.join(", ")} 
                      WHERE userid = ${useridIdx} 
                      AND roomid = ${roomidIdx} 
                      RETURNING *`;
    const res = await db.query(query, [...values, userid, roomid]);
    const roomuser = res.rows[0];
    /// if nothing returned throw error
    if (!roomuser) throw new NotFoundError(`Invalid user or room ID`);
    return roomuser;
  }


  /// Delete roomuser from database. returns string.
  static async leaveRoom(userid, roomid) {
    let res = await db.query(
          `DELETE
           FROM room_users
           WHERE userid = $1 
           AND roomid = $2 
           RETURNING roomid`,
        [userid, roomid],
    );
    const roomuser = res.rows[0];
    /// if nothing found throw error
    if (!roomuser) throw new NotFoundError(`No user with id: ${id}`);
    return "Left Room"
  }
}

module.exports = RoomUser;
