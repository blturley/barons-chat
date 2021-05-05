"use strict";
const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");

class Room {

  /// make new room
  static async create({ roomname, roomowner }) {
    /// check if room name taken
    const res = await db.query(
          `SELECT roomname
           FROM rooms
           WHERE roomname = $1`,
        [roomname]);
    /// if roomname taken throw error
    if (res.rows[0]) throw new BadRequestError(`Room name taken`);
    /// if name not taking generate invitelink
    const invitelink = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    /// if name not taken make new room in database
    const res2 = await db.query(
          `INSERT INTO rooms
           (roomname, roomowner, invitelink)
           VALUES ($1, $2, $3)
           RETURNING *`,
        [roomname, roomowner, invitelink]
    );
    return res2.rows[0];
  }


  /// search room using name
  static async search(nameQuery) {
    const rooms = await db.query(
          `SELECT id, roomname, thumbnail, isprivate       
           FROM rooms 
           WHERE roomname
           ILIKE $1`, 
           ['%'+nameQuery+'%']);
    return rooms.rows;
  }


  /// get specific room info using ID
  static async getById(id) {
    const res = await db.query(
          `SELECT * 
          FROM rooms
          WHERE id = $1`,
        [id]
    );
    const room = res.rows[0];
    if (!room) throw new NotFoundError(`No room with ID: ${id}`);
    return room;
  }


  /// get specific room info using roomname
  static async getByRoomname(roomname) {
    const res = await db.query(
          `SELECT * 
          FROM rooms
          WHERE roomname = $1`,
        [roomname]
    );
    const room = res.rows[0];
    if (!room) throw new NotFoundError(`No room with name: ${roomname}`);
    return room;
  }


  /// get specific room info using invite link
  static async getByInvitelink(invitelink) {
    const res = await db.query(
          `SELECT * 
          FROM rooms
          WHERE invitelink = $1`,
        [invitelink]
    );
    const room = res.rows[0];
    if (!room) throw new NotFoundError(`No room with link: ${invitelink}`);
    return room;
  }


  /// Update room info with data
  static async update(id, data) {
    /// id included in update delete it
    if (data.id) delete data.id;
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
    const query = `UPDATE rooms 
                      SET ${cols.join(", ")} 
                      WHERE id = ${idIdx} 
                      RETURNING *`;
    const res = await db.query(query, [...values, id]);
    const room = res.rows[0];
    /// if nothing returned throw error
    if (!room) throw new NotFoundError(`Invalid room ID`);
    return room;
  }


  /// delete room
  static async delete(id) {
    const result = await db.query(
          `DELETE
           FROM rooms
           WHERE id = $1
           RETURNING roomname`,
        [id]);
    const room = result.rows[0];

    if (!room) throw new NotFoundError(`No room found with ID: ${id}`);
  }
}


module.exports = Room;
