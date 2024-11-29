// src/routes/userRoutes.js
import express from "express";
import { registerUser, loginUser, getUserProfile, updateUserProfile, deleteUser } from "../controllers/userControllers.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { validateUser } from "../middlewares/validationMiddleware.js";

const router = express.Router();

// Routes publiques
router.post("/register", validateUser, registerUser);
router.post("/login", loginUser);

// Routes protégées
router.get("/profile", verifyToken, getUserProfile);
router.put("/profile", verifyToken, validateUser, updateUserProfile);
router.delete("/profile", verifyToken, deleteUser);

export default router;