"use strict";
const jsonschema = require("jsonschema");
const express = require("express");
const { BadRequestError, UnauthorizedError } = require("../expressError");
const { ensureLoggedIn } = require("../middleware/auth");
const Room = require("../models/Room");
const RoomUser = require("../models/RoomUser");
const roomNewSchema = require("../schemas/roomNew.json");
const roomUpdateSchema = require("../schemas/roomUpdate.json");
const router = new express.Router();


/// make new room
router.post("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, roomNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
    req.body["roomowner"] = res.locals.user.id;
    const room = await Room.create(req.body);
    return res.status(201).json({ room });
  } catch (err) {
    return next(err);
  }
});


/// search rooms by room name
router.get("/", async function (req, res, next) {
  try {
    const rooms = await Room.search(req.query.roomname);
    return res.json({ rooms });
  } catch (err) {
    return next(err);
  }
});


/// get room info by ID
router.get("/getbyid/:id", async function (req, res, next) {
  try {
    console.log("hi")
    const room = await Room.getById(req.params.id);
    const users = await RoomUser.getUsersList(room.id);
    /// if user not in room, not site admin, and room is private throw error
    if (room.isprivate === "true" && !users.includes(res.locals.user.username) && res.locals.user.isjanie === 'false') throw new UnauthorizedError();
    return res.json({ room });
  } catch (err) {
    return next(err);
  }
});


/// get room info by room name
router.get("/getbyroomname/:roomname", async function (req, res, next) {
  try {
    const room = await Room.getbyRoomname(req.params.roomname);
    const users = await RoomUser.getUsersList(room.id);
    /// if user not in room, not site admin, and room is private throw error
    if (room.isprivate === "true" && !users.includes(res.local.user.username) && res.locals.user.isjanie === 'false') throw new UnauthorizedError();
    return res.json({ room });
  } catch (err) {
    return next(err);
  }
});


/// get room info by invitelink
router.get("/getbyinvitelink/:invitelink", async function (req, res, next) {
  try {
    const room = await Room.getByInvitelink(req.params.invitelink);
    return res.json({ room });
  } catch (err) {
    return next(err);
  }
});


/// update room with data in body
router.patch("/:id", ensureLoggedIn, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, roomUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
    const check = await Room.getById(req.params.id);
    /// check if user owns room or is site admin
    if (res.locals.user.id !== check.roomowner && res.locals.user.isjanie === 'false') throw new UnauthorizedError();
    const room = await Room.update(req.params.id, req.body);
    return res.json({ room });
  } catch (err) {
    return next(err);
  }
});


/// delete room
router.delete("/:id", ensureLoggedIn, async function (req, res, next) {
  try {
    const check = await Room.getById(req.params.id);
    /// check if user owns room or is site admin
    if (res.locals.user.id !== check.roomowner && res.locals.user.isjanie === 'false') throw new UnauthorizedError();
    const room = await Room.delete(req.params.id);
    return res.json(room);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
