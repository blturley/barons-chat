"use strict";

const { Client } = require("pg");
const { getDatabaseUri, PORT } = require("./config");

const db = new Client({
  connectionString: getDatabaseUri(),
  port: PORT,
  ssl:true,
  dialect: "postgres",
});

db.connect();

module.exports = db;
