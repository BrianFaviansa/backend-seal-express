const jwt = require("jsonwebtoken");
const asyncHandler = require("./asyncHandler");
const prisma = require("../db");

const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;
  token = req.cookies.jwt;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await prisma.user.findUnique({ where: { id: decoded.id } });
      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized, token is not valid");
    }
  } else {
    res.status(401);
    throw new Error("Not authorized, no token found");
  }
});

module.exports = authMiddleware;
