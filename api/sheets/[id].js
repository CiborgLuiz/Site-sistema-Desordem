"use strict";

const path = require("path");
const app = require(path.join(__dirname, "..", "..", "server"));

module.exports = (req, res) => {
  if (!req.url.startsWith("/api")) {
    req.url = `/api${req.url}`;
  }

  return app(req, res);
};
