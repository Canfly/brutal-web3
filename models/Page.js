// models/Page.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Page = sequelize.define('Page', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    timestamps: true,
});

// Определяем связь между User и Page
User.hasMany(Page, { foreignKey: 'userId' });
Page.belongsTo(User, { foreignKey: 'userId' });

module.exports = Page;
