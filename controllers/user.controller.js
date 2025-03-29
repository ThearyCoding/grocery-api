const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwt_secret = process.env.JWT_SCRET;
const jwt_expires_in = process.env.JWT_EXPIRES_IN;
const generateToken = (userId) => {
  return jwt.sign({id: userId,},jwt_secret, {expiresIn: jwt_expires_in});
}
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ message: "User already registered in this email." });
    }
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    req.body.password = hashPassword;
    const newUser = new User(req.body);
    await newUser.save();

    const token = generateToken(newUser._id);



    res.status(201).json({ message: "User registered successfully.", user: newUser, token: token });
  } catch (error) {
    res.status(500).json({ message: "Error: " + error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email and password." });
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email and password." });
    }
    console.log(user._id);
    const token = generateToken(user._id);
    res.status(201).json({ message: "Login Successfully.", user: user , token: token });
  } catch (error) {
    res.status(500).json({ message: "Error: " + error.message });
  }
};

exports.getUser = async (req,res) => {
  try {
    const userId = req.user.id;
    const user = await User.findOne({_id: userId}).select("-password");

    if(!user){
      return res.status(404).json({message: "User not found."})
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error: " + error.message });
    console.log(error);
  }
}