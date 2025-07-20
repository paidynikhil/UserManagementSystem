import express from "express";
import { signup, login, getParentUsers } from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/parents", getParentUsers);

export default router;
