import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./user.js";

const Event = sequelize.define("Event", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  maxParticipants: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 50
  },
  participants: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  creatorId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: true
});

// Relations
Event.belongsTo(User, { 
  as: 'creator',
  foreignKey: 'creatorId'
});

export default Event;