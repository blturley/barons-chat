"use strict";
/// import express and router
const express = require("express");
const router = new express.Router();
/// import models
const Room = require("../models/Room");
const RoomUser = require("../models/RoomUser");
const User = require("../models/User");
/// import jsonschema and schemas
const jsonschema = require("jsonschema");
const roomuserNewSchema = require("../schemas/roomuserNew.json");
const roomuserUpdateSchema = require("../schemas/roomuserUpdate.json");
/// import helpers, errors, and middleware
const { BadRequestError, UnauthorizedError } = require("../expressError");
const { ensureLoggedIn} = require("../middleware/auth");


/// adds user to room using user ID and invite link in request body
router.post("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const room = await Room.getByInvitelink(req.body.invitelink);
    if (res.locals.user.isjanie === "false" && room.isprivate === "true" && res.locals.user.id !== req.body.userid) {
      const check = RoomUser.getRoomUser(res.locals.user.id, req.body.roomid)
      if (check.isadmin === "false") throw new UnauthorizedError();
    }
    const validator = jsonschema.validate({userid: req.body.userid, roomid: room.id}, roomuserNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
    const joined = await RoomUser.joinRoom(req.body.userid, room.id);
    return res.status(201).json({ joined });
  } catch (err) {
    return next(err);
  }
});


/// get user's room info using user ID and room ID in reqest query
router.get("/", ensureLoggedIn, async function (req, res, next) {
  try {
    if (res.locals.user.isjanie === "false" && res.locals.user.id !== req.query.userid) {
      const check = RoomUser.getRoomUser(res.locals.user.id, req.query.roomid)
      if (!check) throw new UnauthorizedError();
      if (check.isadmin === "false") throw new UnauthorizedError();
    }
    const roomuser = await RoomUser.getRoomUser(req.query.userid, req.query.roomid);
    return res.status(201).json({ roomuser });
  } catch (err) {
    return next(err);
  }
});


/// get list of room's users using room Id
router.get("/:id", ensureLoggedIn, async function (req, res, next) {
  try {
    const roomusers = await RoomUser.getUsersList(req.params.id);
    if (res.locals.user.isjanie === "false") {
      const user = User.getbyId(res.locals.user.id);
      if (!roomusers.includes(user.username)) throw new UnauthorizedError();
    }
    return res.status(201).json({ roomusers });
  } catch (err) {
    return next(err);
  }
});


/// update user's room info
router.patch("/:roomid/user/:userid", async function (req, res, next) {
  try {
    if (res.locals.user.isjanie === "false" && res.locals.user.id !== req.params.userid) {
      const check = RoomUser.getRoomUser(res.locals.user.id, req.params.roomid)
      if (check.isadmin === "false") throw new UnauthorizedError();
    }
    const validator = jsonschema.validate(req.body, roomuserUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
    const roomuser = await RoomUser.update(req.params.userid, req.params.roomid, req.body);
    return res.json({ roomuser });
  } catch (err) {
    return next(err);
  }
});


/// remove user from room
router.delete("/", async function (req, res, next) {
  try {
    if (res.locals.user.isjanie === "false" && res.locals.user.id !== req.body.userid) {
      const check = RoomUser.getRoomUser(res.locals.user.id, req.body.roomid)
      if (check.isadmin === "false") throw new UnauthorizedError();
    }
    const left = await RoomUser.leaveRoom(req.body.userid, req.body.roomid);
    return res.json(left);
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
