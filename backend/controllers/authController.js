import { signupService, loginService } from "../services/authService.js";

export const signup = async (req, res) => {
  try {
    const { name, email, password, role, parent } = req.body;
    const data = await signupService({ name, email, password, role, parent });
    res.status(201).json({success:true, message:"Registered successfully", data:data});
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const data = await loginService({ email, password });
    res.status(200).json({success:true, message:"logged successful", data:data});
  } catch (err) {
    next(err);
  }
};