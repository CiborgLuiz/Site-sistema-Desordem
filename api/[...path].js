"use strict";

const app = require("../server");

module.exports = (req, res) => {
  // Vercel pode repassar o caminho com ou sem o prefixo /api.
  // Normalizamos para garantir que as rotas do Express sejam encontradas.
  if (!req.url.startsWith("/api")) {
    req.url = `/api${req.url}`;
  }

  return app(req, res);
};
