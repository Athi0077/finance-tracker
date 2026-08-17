const User = require('../models/User');
const ApiError = require('../utils/ApiError');

/**
 * Register a new user 
 */
const registerUser = async ({ name, email, password }) => {
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, 'A user with this email already exists');
  }

  // Create user (password hashed by pre-save hook)
  const user = await User.create({ name, email, password });

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    createdAt: user.createdAt,
  };
};

/**
 * Authenticate user by email and password
 */
const loginUser = async ({ email, password }) => {
  // Find user with password field
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Check password
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    createdAt: user.createdAt,
  };
};

/**
 * Get user profile
 */
const getUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return user;
};

/**
 * Update user profile
 */
const updateUserProfile = async (userId, updates) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Update allowed fields
  if (updates.name) user.name = updates.name;
  if (updates.email) user.email = updates.email;
  if (updates.avatar !== undefined) user.avatar = updates.avatar;
  if (updates.password) {
    if (!updates.currentPassword) {
      throw new ApiError(400, 'Current password is required to change password');
    }
    const isMatch = await user.matchPassword(updates.currentPassword);
    if (!isMatch) {
      throw new ApiError(401, 'Incorrect current password');
    }
    user.password = updates.password;
  }

  await user.save();

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
};
