import bcrypt from "bcryptjs";
import { User } from "../models/userModel.js";
import { generateToken } from "../utils/generateToken.js";

export const signupService = async ({ name, email, password, role, parent }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new Error("User already exists");

  // Validation: Role and Parent Relationship
  if (role === "admin") {
    if (parent) throw new Error("Admin cannot have a parent");
  } else {
    if (!parent) throw new Error(`${role} must select a parent`);
    const parentUser = await User.findById(parent);
    if (!parentUser) throw new Error("Selected parent does not exist");

    if (role === "sub-admin" && parentUser.role !== "admin") {
      throw new Error("Sub-admin's parent must be an Admin");
    }
    if (role === "user" && parentUser.role !== "sub-admin") {
      throw new Error("User's parent must be a Sub-admin");
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    parent: parent || null,
  });

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id),
  };
};

export const loginService = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid credentials");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Invalid credentials");

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id),
  };
};
