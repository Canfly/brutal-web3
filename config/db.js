// config/db.js
const { Sequelize } = require('sequelize');
const path = require('path');

// Создаём подключение к базе данных SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../database.sqlite'), // Путь к файлу базы данных
    logging: false, // Отключаем логирование SQL-запросов
});

module.exports = sequelize;

