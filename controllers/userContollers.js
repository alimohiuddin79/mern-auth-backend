import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";
import generateToken from "../utils/generateToken.js";

// @desc    Register a new user
// @route   POST /api/users/
// @access  PUBLIC

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // check user already exist
  const userExists = await User.findOne({ email });

  // if user exists throw error
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  // check password length
  if (password.length < 8) {
    res.status(403);
    throw new Error("Password length is too short");
  }

  // create salt & hash for new user if user not exist
  const salt = await bcrypt.genSalt(12);
  const hashPassword = await bcrypt.hash(password, salt);

  // create new user if user not exists
  const user = await User.create({
    name,
    email,
    password: hashPassword,
  });

  // check user created successfully in database
  if (user) {
    generateToken(res, user._id);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc    Auth users/set token
// @route   POST /api/users/auth
// @access  PUBLIC

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const userExists = await User.findOne({ email });

  // if user not exists throw error
  if (!userExists) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  // if user exists match password
  const matchPassword = await bcrypt.compare(password, userExists.password);

  if (matchPassword) {
    generateToken(res, userExists._id);
    res.status(201).json({
      _id: userExists._id,
      name: userExists.name,
      email: userExists.email,
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// @desc    Logout user
// @route   POST /api/users/logout
// @access  PUBLIC

const logoutUser = asyncHandler(async (req, res) => {
  // destory cookie name 'jwt'
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: "User Logged out" });
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  PRIVATE

const getUserProfile = asyncHandler(async (req, res) => {
  // get user data from authMiddleware using req.user
  const user = {
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
  };

  res.status(200).json(user);
});

// @desc    Update a user profile
// @route   PUT /api/users/profile
// @access  PRIVATE

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  // update user profile
  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      // check password length
      if (req.body.password.length < 8) {
        res.status(403);
        throw new Error("Password length is too short");
      }

      // create salt & hash to update password
      const salt = await bcrypt.genSalt(12);
      const hashPassword = await bcrypt.hash(req.body.password, salt);

      user.password = hashPassword;

      const updatedUser = await user.save();

      res.status(200).json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
      });
    }
  } else {
    res.status(404);
    throw new Error('User not found');
  }

});

export {
  authUser,
  registerUser,
  getUserProfile,
  logoutUser,
  updateUserProfile,
};
