import { Sequelize } from "sequelize";
import dotenv from "dotenv";

// Charger les variables d'environnement
dotenv.config();

// Connexion à la base de données
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: "mysql",
  port: 3306, // Si votre base de données utilise un port différent, modifiez-le ici
  logging: false,
  define: {
    timestamps: false,
  },
});

// Tester la connexion
sequelize.authenticate()
  .then(() => {
    console.log("Connexion réussie à la base de données.");
  })
  .catch((error) => {
    console.error("Erreur de connexion à la base de données:", error);
  });

export default sequelize;
