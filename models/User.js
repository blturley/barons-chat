"use strict";
const db = require("../db");
const { NotFoundError, BadRequestError, UnauthorizedError } = require("../expressError");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config.js");

class User {

  /// log in user. Returns { id, username, email }
  static async authenticate(username, password) {
    /// try to find user
    const result = await db.query(
          `SELECT id,
                  username,
                  password,
                  isjanie
           FROM users
           WHERE username = $1`,
        [username],
    );
    const user = result.rows[0];
    if (user) {
      /// compare passwords
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid === true) {
        /// delete password from return data
        delete user.password;
        return user;
      }
    }
    /// throw error if user not found or password not valid
    throw new UnauthorizedError("Invalid username/password");
  }


  /// Register user with provided data. Returns { id, username, email }
  static async register({ username, password, email }) {
    /// check for existing user with username
    const res = await db.query(
          `SELECT username
           FROM users
           WHERE username = $1`,
        [username],
    );
    /// throw an error is user exists
    if (res.rows[0]) {
      throw new BadRequestError(`Duplicate username: ${username}`);
    }
    /// hash password with imported work factor
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    /// insert into database, return relevant user info
    const result = await db.query(
          `INSERT INTO users
           (username,
            password,
            email)
           VALUES ($1, $2, $3)
           RETURNING id, isjanie`,
        [ username, hashedPassword, email ]
    );
    const user = result.rows[0];
    return user;
  }


  /// search by username
  static async search(nameQuery) {
    const rooms = await db.query(
          `SELECT username           
           FROM users 
           WHERE username
           ILIKE $1`, 
           ['%'+nameQuery+'%']);
    return rooms.rows;
  }


  /// get user by ID. Returns { id, username, email, rooms: [ roomid, nickname, namecolor, font, isadmin, isbanned ] }
  static async getbyId(id) {
    console.log(id);
    const res = await db.query(
          `SELECT id,
                  username,
                  email,
                  avatar,
                  isjanie
           FROM users
           WHERE id = $1`,
        [id],
    );
    const user = res.rows[0];
    /// return error if no user
    if (!user) throw new NotFoundError(`No user with id: ${id}`);
    /// get list of rooms user is in
    const userRooms = await db.query(
          `SELECT roomid,
                  nickname,
                  namecolor,
                  font,
                  isadmin,
                  isbanned 
           FROM room_users AS r
           WHERE r.userid = $1 AND isbanned = $2`, 
           [id, 'false']);
    /// add rooms to return data
    user.rooms = userRooms.rows;
    return user;
  }


  /// get user by username. Returns { id, username, email, rooms: [ roomid, nickname, namecolor, font, isadmin, isbanned ] }
  static async getbyUsername(username) {
    const res = await db.query(
          `SELECT id,
                  username,
                  email,
                  avatar,
                  isjanie
           FROM users
           WHERE username = $1`,
        [username],
    );
    const user = res.rows[0];
    /// return error if no user
    if (!user) throw new NotFoundError(`No user with username: ${username}`);
    /// get list of rooms user is in
    const userRooms = await db.query(
          `SELECT roomid,
                  nickname,
                  namecolor,
                  font,
                  isadmin,
                  isbanned 
           FROM room_users AS r
           WHERE r.userid = $1 AND isbanned = $2`, 
           [user.id, 'false']);
    /// add rooms to return data
    user.rooms = userRooms.rows;
    return user;
  }


  /// get list of user's rooms
  static async getUserRooms(id) {
    /// get rooms user is a member of
    const res1 = await db.query(
      `SELECT r.id, r.roomname, r.thumbnail, r.isprivate, r.invitelink 
      FROM rooms r RIGHT JOIN room_users u 
      ON r.id = u.roomid  
      WHERE u.userid = $1`, 
      [id]);
    const ismember = res1.rows;
    /// get rooms user owns
    const res2 = await db.query(
          `SELECT id, roomname, thumbnail, isprivate, invitelink 
          FROM rooms 
          WHERE roomowner = $1`, 
          [id]);
    const isowner = res2.rows;
    return {ismember, isowner};
  }


  /// Update user with data
  static async update(id, data) {
    /// id included in update delete it
    if (data.id) delete data.id;
    /// if password in update encrypt it
    if (data.password) data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
    /// get arrays of keys and values from data
    const keys = Object.keys(data);
    const values = Object.values(data);
    /// make sql strings out of keys
    const cols = keys.map((name, idx) =>
      `"${name}"=$${idx + 1}`,
    );
    /// make sql out of id and it's index
    const idIdx = "$" + (values.length + 1);
    /// make sql query out of strings and columns
    const query = `UPDATE users 
                      SET ${cols.join(", ")} 
                      WHERE id = ${idIdx} 
                      RETURNING id, username, email, avatar`;
    const res = await db.query(query, [...values, id]);
    const user = res.rows[0];
    /// if nothing returned throw error
    if (!user) throw new NotFoundError(`No user with id: ${id}`);
    return user;
  }


  /// Delete user from database. returns string.
  static async delete(id) {
    let res = await db.query(
          `DELETE
           FROM users
           WHERE id = $1
           RETURNING username`,
        [id],
    );
    const user = res.rows[0];
    /// if nothing found throw error
    if (!user) throw new NotFoundError(`No user with id: ${id}`);
    return "User Deleted"
  }
}


module.exports = User;
