const express = require("express");
const {
  register,
  login,
  getUser,
  logout,
  updateUser,
  deleteUser,
  getAllUsers,
} = require("../controller/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../utils/uploadFileHandler");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/get-user", authMiddleware, getUser);
router.get("/logout", authMiddleware, logout);
router.put("/update-user/:id", authMiddleware, upload.single("photo"), updateUser);
router.delete("/delete-user/:id", authMiddleware, deleteUser);
router.get("/get-users", authMiddleware, getAllUsers);

module.exports = router;
