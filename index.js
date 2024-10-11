// index.js
require('dotenv').config(); // Если используете dotenv

const express = require('express');
const bip39 = require('bip39');
const crypto = require('crypto');
const path = require('path');
const { ethers } = require('ethers');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

const sequelize = require('./config/db');
const User = require('./models/User');
const Page = require('./models/Page');

const app = express();
const port = process.env.PORT || 3000;

// Настраиваем EJS как шаблонизатор
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware для обработки данных из форм и JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Используем статические файлы из папки public
app.use(express.static('public'));

// Настройка сессий
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key', // Используйте переменную окружения для секретного ключа
    store: new SequelizeStore({
        db: sequelize,
    }),
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 1 день
        secure: process.env.NODE_ENV === 'production', // Только по HTTPS в продакшене
        httpOnly: true, // Защита от XSS
    }
}));

// Middleware для передачи переменной `user` во все шаблоны
app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});

// Синхронизация базы данных
sequelize.sync()
    .then(() => {
        console.log('Database synced');
    })
    .catch((err) => {
        console.error('Failed to sync database:', err);
    });

// Маршрут для главной страницы (Login)
app.get('/', (req, res) => {
    if (req.session.user) {
        // Если пользователь уже авторизован, перенаправляем на профиль
        res.redirect('/profile');
    } else {
        res.render('login');
    }
});

// Маршрут для логина через Web3
app.post('/api/login', async (req, res) => {
    const { address, name } = req.body;

    if (!address) {
        return res.status(400).json({ error: 'Address is required' });
    }

    try {
        // Ищем пользователя по адресу
        let user = await User.findOne({ where: { address } });

        if (!user) {
            // Если пользователь не найден, создаём нового с именем (если предоставлено)
            user = await User.create({ address, name: name || null });
        } else if (name) {
            // Если пользователь существует и предоставлено новое имя, обновляем его
            user.name = name;
            await user.save();
        }

        // Сохраняем пользователя в сессии
        req.session.user = {
            id: user.id,
            address: user.address,
            name: user.name,
        };

        res.status(200).json({ message: 'Logged in successfully' });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Маршрут для выхода из аккаунта
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.redirect('/');
    });
});

// Маршрут для профиля пользователя
app.get('/profile', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }

    try {
        // Получаем данные пользователя из базы
        const user = await User.findByPk(req.session.user.id, {
            include: [Page],
        });

        res.render('profile', { user, pages: user.Pages });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.redirect('/error');
    }
});

// Маршрут для создания новой страницы
app.post('/profile/create-page', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }

    const { title } = req.body;

    if (!title) {
        return res.status(400).send('Title is required');
    }

    try {
        // Создаём новую страницу
        const page = await Page.create({
            title,
            userId: req.session.user.id,
        });

        res.redirect('/profile');
    } catch (error) {
        console.error('Error creating page:', error);
        res.redirect('/error');
    }
});

// Маршрут для отображения конкретной страницы
app.get('/page/:id', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }

    const { id } = req.params;

    try {
        // Находим страницу по ID и удостоверяемся, что она принадлежит пользователю
        const page = await Page.findOne({
            where: { id, userId: req.session.user.id },
        });

        if (!page) {
            return res.status(404).send('Page not found');
        }

        res.render('page', { page, user: req.session.user });
    } catch (error) {
        console.error('Error fetching page:', error);
        res.redirect('/error');
    }
});

// Маршрут для страницы ошибки
app.get('/error', (req, res) => {
    res.render('error');
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
