import User from "../models/user.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { ValidationError } from "sequelize";
import validator from "validator"; // Pour la validation de l'email

// Inscription
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Vérification du format de l'email
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Email invalide" });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Cet email est déjà utilisé" });
    }

    const hashedPassword = await bcryptjs.hash(password, 12);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword
    });

    // Créer le token
    const token = jwt.sign(
      { id: newUser.id },
      process.env.JWT_SECRET || "default_secret", // Utilisation d'une valeur par défaut si JWT_SECRET est manquant
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "Inscription réussie",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      },
      token
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ message: error.message });
    }
    console.error(error); // Ajout d'un log pour mieux comprendre l'erreur
    res.status(500).json({ message: "Erreur lors de l'inscription" });
  }
};

// Connexion
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({
      where: { email },
      attributes: ['id', 'name', 'email', 'password'] // Inclure le mot de passe
    });
    if (!user) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    const isValidPassword = await bcryptjs.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || "default_secret", //
      { expiresIn: "24h" }
    );

    res.status(200).json({
      message: "Connexion réussie",
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error(error); // Ajout d'un log pour mieux comprendre l'erreur
    res.status(500).json({ message: "Erreur lors de la connexion" });
  }
};

// Obtenir le profil utilisateur
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error); // Ajout d'un log pour mieux comprendre l'erreur
    res.status(500).json({ message: "Erreur lors de la récupération du profil" });
  }
};

// Mettre à jour le profil
export const updateUserProfile = async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Si changement de mot de passe
    if (currentPassword && newPassword) {
      const isValidPassword = await bcryptjs.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Mot de passe actuel incorrect" });
      }
      user.password = await bcryptjs.hash(newPassword, 12);
    }

    // Mise à jour des autres champs
    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    res.status(200).json({
      message: "Profil mis à jour avec succès",
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ message: error.message });
    }
    console.error(error); // Ajout d'un log pour mieux comprendre l'erreur
    res.status(500).json({ message: "Erreur lors de la mise à jour du profil" });
  }
};

// Supprimer le compte
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    await user.destroy();
    res.status(200).json({ message: "Compte supprimé avec succès" });
  } catch (error) {
    console.error(error); // Ajout d'un log pour mieux comprendre l'erreur
    res.status(500).json({ message: "Erreur lors de la suppression du compte" });
  }
};
