const Jwt = require("jsonwebtoken");
require("dotenv").config();
const createError = require("http-errors");

module.exports = {
  signAccessToken: (userId) => {
    return new Promise((resolve, reject) => {
      const payload = {};
      const secret = process.env.access_token;
      const options = {
        expiresIn: "15s",
        issuer: "Wordrobe Gallery",
        audience: userId,
      };
      Jwt.sign(payload, secret, options, (err, token) => {
        if (err) return reject(createError.InternalServerError());
        resolve(token);
      });
    });
  },

  verifyAccessToken: (req, res, next) => {
    if (!req.headers["authorization"]) return next(createError.Unauthorized());
    const authHeader = req.headers["authorization"];
    const barerToken = authHeader.split(" ");
    const token = barerToken[1];
    Jwt.verify(token, process.env.access_token, (err, payload) => {
      if (err) {
        return next(createError.Unauthorized());
      }

      req.payload = payload;
      next();
    });
  },
};
