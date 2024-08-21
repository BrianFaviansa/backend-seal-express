const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const fs = require("fs");
const path = require("path");
const asyncHandler = require("../middlewares/asyncHandler");
const prisma = require("../db");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

const setCookie = (res, token) => {
  const isDev = process.env.NODE_ENV === "development" ? false : true;
  const cookieOption = {
    expire: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: isDev,
  };
  res.cookie("jwt", token, cookieOption);
};

const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new Error("Please provide name, email, and password");
  }

  if (!validator.isEmail(email)) {
    throw new Error("Please provide a valid email");
  }

  if (password.length < 5) {
    throw new Error("Password must be at least 5 characters");
  }

  if (name.length < 5) {
    throw new Error("Name must be at least 5 characters");
  }

  const userExist = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (userExist) {
    throw new Error("User already exist");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  const token = signToken(newUser.id);
  setCookie(res, token);

  newUser.password = undefined;
  newUser.photo = undefined;

  res.status(201).json({
    message: "User registered successfully",
    data: newUser,
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new Error("Please provide email and password");
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (user && (await comparePassword(password, user.password))) {
    const token = signToken(user.id);
    setCookie(res, token);

    user.password = undefined;
    user.photo = undefined;

    res.status(200).json({
      message: "User logged in successfully",
      data: user,
    });
  } else {
    throw new Error("Invalid credentials");
  }
});

const getUser = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      id: req.user.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      photo: true,
    },
  });

  if (user) {
    return res.status(200).json({
      message: "User retrieved successfully",
      user,
    });
  } else {
    throw new Error("User not found");
  }
});

const logout = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });

  res.status(200).json({
    message: "User logged out successfully",
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const { name, email } = req.body;
  let photo = req.file ? req.file.filename : null;
  let pathPhotoFile;

  const user = await prisma.user.findUnique({
    where: {
      id: parseInt(id),
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (req.user.id !== user.id) {
    throw new Error("You are not authorized to perform this action");
  }

  if (!name || !email) {
    throw new Error("Please provide name and email");
  }

  if (photo) {
    const baseUrl = `${req.protocol}://${req.get("host")}/uploads`;
    pathPhotoFile = `${baseUrl}/${photo}`;

    if (user.photo) {
      const oldPhotoFileName = path.basename(user.photo);
      const oldPhotoPath = path.resolve(
        __dirname,
        "..",
        "..",
        "public",
        "uploads",
        oldPhotoFileName
      );
      deleteOldPhoto(oldPhotoPath);
    }
  } else {
    pathPhotoFile = user.photo;
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: parseInt(id),
    },
    data: {
      name,
      email,
      photo: pathPhotoFile,
    },
  });

  updatedUser.password = undefined;

  res.status(200).json({
    message: "User updated successfully",
    data: updatedUser,
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  const id = req.params.id;

  const user = await prisma.user.findUnique({
    where: {
      id: parseInt(id),
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  await prisma.user.delete({
    where: {
      id: parseInt(id),
    },
  });

  if (user.photo) {
    const photoFileName = path.basename(user.photo);
    const photoPath = path.resolve(
      __dirname,
      "..",
      "..",
      "public",
      "uploads",
      photoFileName
    );
    deleteOldPhoto(photoPath);
  }

  res.status(200).json({
    message: "User deleted successfully",
  });
});

const deleteOldPhoto = (oldPhotoPath) => {
  if (oldPhotoPath && fs.existsSync(oldPhotoPath)) {
    try {
      fs.unlinkSync(oldPhotoPath);
      console.log("Old photo deleted successfully");
    } catch (error) {
      console.error(`Error deleting old photo: ${error.message}`);
    }
  }
};

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      photo: true,
    },
  });

  res.status(200).json({
    message: "Users retrieved successfully",
    data: users,
  });
});

module.exports = {
  register,
  login,
  getUser,
  logout,
  updateUser,
  deleteUser,
  getAllUsers,
};
