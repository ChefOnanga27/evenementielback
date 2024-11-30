import 'dotenv/config';
import app from "./app.js";
import sequelize from "./src/config/db.js";

const PORT = process.env.PORT || 10000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie avec succès.');

    await sequelize.sync({ alter: true });
    console.log('✅ Modèles synchronisés avec la base de données.');

    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
}

startServer();