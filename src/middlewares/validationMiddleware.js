// src/middlewares/validationMiddleware.js
export const validateUser = (req, res, next) => {
  const { name, email, password } = req.body;
  
  if (!email || !email.includes('@')) {
    return res.status(400).json({ message: "Email invalide" });
  }
  
  if (!password || password.length < 6) {
    return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caractères" });
  }
  
  if (name && name.length < 2) {
    return res.status(400).json({ message: "Le nom doit contenir au moins 2 caractères" });
  }
  
  next();
};

export const validateEvent = (req, res, next) => {
  const { title, description, date, location, maxParticipants } = req.body;
  
  if (!title || title.length < 3) {
    return res.status(400).json({ message: "Le titre doit contenir au moins 3 caractères" });
  }
  
  if (!description || description.length < 10) {
    return res.status(400).json({ message: "La description doit contenir au moins 10 caractères" });
  }
  
  if (!date || new Date(date) < new Date()) {
    return res.status(400).json({ message: "La date doit être dans le futur" });
  }
  
  if (!location) {
    return res.status(400).json({ message: "La localisation est requise" });
  }
  
  if (maxParticipants && maxParticipants < 1) {
    return res.status(400).json({ message: "Le nombre maximum de participants doit être positif" });
  }
  
  next();
};