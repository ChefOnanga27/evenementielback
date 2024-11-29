// src/controllers/eventController.js
import Event from "../models/events.js";
import User from "../models/user.js";
import { ValidationError } from "sequelize";

// Créer un événement
export const createEvent = async (req, res) => {
  try {
    const { title, description, date, location, maxParticipants } = req.body;
    
    const event = await Event.create({
      title,
      description,
      date,
      location,
      maxParticipants,
      creatorId: req.user.id,
      participants: [req.user.id]
    });

    res.status(201).json({
      message: "Événement créé avec succès",
      event
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Erreur lors de la création de l'événement" });
  }
};

// Récupérer tous les événements
export const getAllEvents = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;
    
    const whereClause = search ? {
      [Op.or]: [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ]
    } : {};

    const events = await Event.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'name']
      }],
      order: [['date', 'ASC']]
    });

    res.status(200).json({
      events: events.rows,
      totalPages: Math.ceil(events.count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des événements" });
  }
};

// Récupérer un événement spécifique
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'name']
      }, {
        model: User,
        as: 'participants',
        attributes: ['id', 'name']
      }]
    });

    if (!event) {
      return res.status(404).json({ message: "Événement non trouvé" });
    }

    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération de l'événement" });
  }
};

// Mettre à jour un événement
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: "Événement non trouvé" });
    }

    if (event.creatorId !== req.user.id) {
      return res.status(403).json({ message: "Non autorisé à modifier cet événement" });
    }

    const { title, description, date, location, maxParticipants } = req.body;
    
    await event.update({
      title,
      description,
      date,
      location,
      maxParticipants
    });

    res.status(200).json({
      message: "Événement mis à jour avec succès",
      event
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Erreur lors de la mise à jour de l'événement" });
  }
};

// Supprimer un événement
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: "Événement non trouvé" });
    }

    if (event.creatorId !== req.user.id) {
      return res.status(403).json({ message: "Non autorisé à supprimer cet événement" });
    }

    await event.destroy();
    res.status(200).json({ message: "Événement supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression de l'événement" });
  }
};

// Récupérer les événements d'un utilisateur
export const getUserEvents = async (req, res) => {
  try {
    const events = await Event.findAll({
      where: {
        [Op.or]: [
          { creatorId: req.user.id },
          { participants: { [Op.contains]: [req.user.id] } }
        ]
      },
      include: [{
        model: User,
        as: 'creator',
        attributes: ['id', 'name']
      }]
    });

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des événements" });
  }
};

// Rejoindre un événement
export const joinEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: "Événement non trouvé" });
    }

    if (event.participants.includes(req.user.id)) {
      return res.status(400).json({ message: "Vous participez déjà à cet événement" });
    }

    if (event.participants.length >= event.maxParticipants) {
      return res.status(400).json({ message: "L'événement est complet" });
    }

    event.participants = [...event.participants, req.user.id];
    await event.save();

    res.status(200).json({ message: "Vous avez rejoint l'événement avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l'inscription à l'événement" });
  }
};

// Quitter un événement
export const leaveEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: "Événement non trouvé" });
    }

    if (!event.participants.includes(req.user.id)) {
      return res.status(400).json({ message: "Vous ne participez pas à cet événement" });
    }

    if (event.creatorId === req.user.id) {
      return res.status(400).json({ message: "Le créateur ne peut pas quitter son événement" });
    }

    event.participants = event.participants.filter(id => id !== req.user.id);
    await event.save();

    res.status(200).json({ message: "Vous avez quitté l'événement avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du départ de l'événement" });
  }
};