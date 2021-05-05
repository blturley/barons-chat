"use strict";
/// import express and router
const express = require("express");
const router = new express.Router();
/// import models
const User = require("../models/User");
/// import jsonschema and schemas
const jsonschema = require("jsonschema");
const userUpdateSchema = require("../schemas/userUpdate.json");
/// import helpers, errors, and middleware
const { BadRequestError, UnauthorizedError } = require("../expressError");
const { ensureCorrectUserIdOrJanie } = require("../middleware/auth");


/// search users by username
router.get("/", async function (req, res, next) {
  if(!req.query) return [];
  if(!req.query.username) return [];
  try {
    const users = await User.search(req.query.username);
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
});


/// get specific user by ID
router.get("/getbyid/:id", ensureCorrectUserIdOrJanie, async function (req, res, next) {
  try {
    const luser = res.locals.user;
    if (!(luser && (luser.isjanie || luser.id === +req.params.id))) {
      throw new UnauthorizedError();
    }
    const user = await User.getbyId(req.params.id);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});


/// get specific user by username
router.get("/getbyusername/:username", async function (req, res, next) {
  try {
    if (res.locals.user.isjanie === "false"){
      const check = await User.getbyId(res.locals.user.id);
      if (check.username !== req.params.username) throw new UnauthorizedError();
    }
    const user = await User.getbyUsername(req.params.username);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});


/// get user's rooms by id
router.get("/getrooms/:id", ensureCorrectUserIdOrJanie, async function (req, res, next) {
  try {
    const rooms = await User.getUserRooms(req.params.id);
    const owned = rooms.isowner.map(room => room.id);
    const member = rooms.ismember.filter(room => !owned.includes(room.id))
    return res.json({ rooms: {isowner: rooms.isowner, ismember: member} });
  } catch (err) {
    return next(err);
  }
});


/// updates user
router.patch("/:id", ensureCorrectUserIdOrJanie, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
    const user = await User.update(req.params.id, req.body);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});


/// deletes user
router.delete("/:id", ensureCorrectUserIdOrJanie, async function (req, res, next) {
  try {
    await User.delete(req.params.id);
    return res.json("user deleted");
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
