import { signupService, loginService } from "../services/authService.js";
import { User } from "../models/userModel.js";

export const signup = async (req, res) => {
  try {
    const { name, email, password, role, parent } = req.body;
    const data = await signupService({ name, email, password, role, parent });
    res.status(201).json({ success: true, message: "Registered successfully", data });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const data = await loginService({ email, password });
    res.status(200).json({ success: true, message: "Login successful", data });
  } catch (err) {
    next(err);
  }
};

export const getParentUsers = async (req, res) => {
  try {
    const { role } = req.query;

    let parentRole;

    if (role === "sub-admin") {
      parentRole = "admin";
    } else if (role === "user") {
      parentRole = "sub-admin";
    } else {
      return res.status(400).json({ error: "Invalid role provided" });
    }

    const parents = await User.find({ role: parentRole }).select("_id name email role");

    res.status(200).json({ success: true, data: parents });
  } catch (err) {
    res.status(500).json({ error: "Server error fetching parent users" });
  }
};
