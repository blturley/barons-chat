"use strict";
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");
const RoomUser = require("../models/RoomUser");


function authenticateJWT(req, res, next) {
  try {
    const token = req.headers && req.headers.authorization;
    if (token) {
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (err) {
    return next();
  }
}


function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}


function ensureJanie(req, res, next) {
  try {
    if (!res.locals.user || !res.locals.user.isjanie) {
      throw new UnauthorizedError();
    }
    return next();
  } catch (err) {
    return next(err);
  }
}


function ensureCorrectUserIdOrJanie(req, res, next) {
  try {
    const user = res.locals.user;
    if (!(user && (user.isjanie || user.id === +req.params.id))) {
      throw new UnauthorizedError();
    }
    return next();
  } catch (err) {
    return next(err);
  }
}


async function ensureUserInRoom(req, res, next) {
  try {
    const user = res.locals.user;
    if (!user) throw new UnauthorizedError();
    const roomUser = await RoomUser.getRoomUser(user.id, req.params.id);
    if (!roomUser) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}


module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureJanie,
  ensureCorrectUserIdOrJanie,
  ensureUserInRoom
};
