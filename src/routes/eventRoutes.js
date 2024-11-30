// src/routes/eventRoutes.js
import express from "express";
import { 
  createEvent, 
  getAllEvents, 
  getEventById, 
  updateEvent, 
  deleteEvent,
  getUserEvents,
  joinEvent,
  leaveEvent
} from "../controllers/eventController.js";
import { verifyToken } from "../middlewares/authmiddleware.js";
import { validateEvent } from "../middlewares/validationMiddleware.js";

const router = express.Router();

// Routes publiques
router.get("/", getAllEvents);
router.get("/:id", getEventById);

// Routes protégées
router.post("/", verifyToken, validateEvent, createEvent);
router.put("/:id", verifyToken, validateEvent, updateEvent);
router.delete("/:id", verifyToken, deleteEvent);

// Routes supplémentaires
router.get("/user/events", verifyToken, getUserEvents);
router.post("/:id/join", verifyToken, joinEvent);
router.post("/:id/leave", verifyToken, leaveEvent);

export default router;