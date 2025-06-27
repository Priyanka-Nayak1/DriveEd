const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  const { userName, userEmail, password, role, faceDescriptor } = req.body;


  // Check for missing face descriptor
  if (!faceDescriptor || !Array.isArray(faceDescriptor) || faceDescriptor.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Face Id is required"
    });
  }

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ userEmail }, { userName }],
  });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: "User name or user email already exists",
    });
  }

  // Hash password
  const hashPassword = await bcrypt.hash(password, 10);

  // Create and save new user
  const newUser = new User({
    userName,
    userEmail,
    role,
    password: hashPassword,
    faceDescriptor,
  });

  await newUser.save();

  return res.status(201).json({
    success: true,
    message: "User registered successfully!",
  });
};




const loginUser = async (req, res) => {
  const { userEmail, password } = req.body;

  // 1. Find user by email
  const checkUser = await User.findOne({ userEmail });
  if (!checkUser) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials", // Email doesn't exist
    });
  }

  // 2. Validate password
  const isPasswordValid = await bcrypt.compare(password, checkUser.password);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials", // Password mismatch
    });
  }

  // 3. Compare face descriptor (Euclidean distance)
  // const euclideanDistance = (a, b) =>
  //   Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0));

  // const distance = euclideanDistance(faceDescriptor, checkUser.faceDescriptor);
  // const threshold = 0.45;
  // const isFaceMatch = distance < threshold;

  // if (!isFaceMatch) {
  //   return res.status(403).json({
  //     success: false,
  //     message: "Face is not matching", // Face mismatch
  //   });
  // }

  // 4. Generate token and respond
  const accessToken = jwt.sign(
    {
      _id: checkUser._id,
      userName: checkUser.userName,
      userEmail: checkUser.userEmail,
      role: checkUser.role,
    },
    "JWT_SECRET",
    { expiresIn: "120m" }
  );

  return res.status(200).json({
    success: true,
    message: "Logged in successfully",
    data: {
      accessToken,
      user: {
        _id: checkUser._id,
        userName: checkUser.userName,
        userEmail: checkUser.userEmail,
        role: checkUser.role,
      },
    },
  });
};


module.exports = { registerUser, loginUser };
