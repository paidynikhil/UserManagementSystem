import express from "express";
import { getHierarchyTree } from "../controllers/hierarchyController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { allowRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.get(
  "/tree",
  authMiddleware,
  allowRoles("admin", "sub-admin"),
  getHierarchyTree
);

export default router;
