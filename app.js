import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import userRoutes from "./src/routes/userRoutes.js";
import eventRoutes from "./src/routes/eventRoutes.js";

const app = express();

// Middlewares de sécurité et utilitaires
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware CORS
const corsOptions = {
  origin: "http://localhost:3000", // Remplacez par l'origine autorisée
  methods: "GET,POST,PUT,DELETE",
  credentials: true, // Autorise l'envoi de cookies ou d'en-têtes sécurisés
};

// Routes
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);

// Route de test API
app.get("/", (req, res) => {
  res.status(200).json({ status: "OK", message: "API opérationnelle" });
});

// Gestion des routes non trouvées
app.use((req, res, next) => {
  res.status(404).json({ 
    status: "error",
    message: "Route non trouvée" 
  });
});

// Gestion globale des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Une erreur est survenue sur le serveur",
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

export default app;