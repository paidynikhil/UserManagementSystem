import { User } from "../models/userModel.js";

export const getHierarchyTreeService = async (user) => {
  if (user.role === "admin") {
    const subAdmins = await User.find({ parent: user._id, role: "sub-admin" })
      .select("-password")
      .lean();

    for (const sub of subAdmins) {
      const users = await User.find({ parent: sub._id, role: "user" }).select("-password").lean();
      sub.users = users;
    }

    return subAdmins;
  }

  if (user.role === "sub-admin") {
    const users = await User.find({ parent: user._id, role: "user" }).select("-password").lean();
    return users;
  }

  throw new Error("Only admins and sub-admins can view the tree");
};
