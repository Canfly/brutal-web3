// pages/api/add-page.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { title } = req.body;
    const userAddress = req.headers['x-user-address'];

    if (!userAddress) {
      return res.status(401).json({ error: 'Не авторизован' });
    }

    if (!title) {
      return res.status(400).json({ error: 'Название страницы обязательно' });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { address: userAddress },
      });

      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      const newPage = await prisma.page.create({
        data: {
          title,
          userId: user.id,
        },
      });

      const updatedUser = await prisma.user.findUnique({
        where: { address: userAddress },
        include: { createdPages: true },
      });

      res.status(200).json(updatedUser);
    } catch (error) {
      console.error("Ошибка при добавлении страницы:", error);
      res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Метод ${req.method} не разрешён`);
  }
}

