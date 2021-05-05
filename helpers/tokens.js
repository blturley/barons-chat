const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

/// return signed JWT with user id and admin info
function createToken(user) {
  let payload = { id: user.id, isjanie: user.isjanie };
  return jwt.sign(payload, SECRET_KEY);
}

module.exports = { createToken };
