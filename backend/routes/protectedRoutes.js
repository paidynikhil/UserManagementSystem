import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { allowRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.get("/admin-only", authMiddleware, allowRoles("admin"), (req, res) => {
  res.json({ message: `Welcome, Admin ${req.user.name}` });
});

router.get("/subadmin-or-admin", authMiddleware, allowRoles("admin", "sub-admin"), (req, res) => {
  res.json({ message: `Hello ${req.user.role} ${req.user.name}` });
});

export default router;
