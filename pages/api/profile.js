// pages/api/profile.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { address } = req.query;

    // Предполагается, что адрес передаётся в заголовках или куки
    // Для упрощения используем localStorage на клиенте и передаём адрес через запрос

    const userAddress = req.headers['x-user-address'];

    if (!userAddress) {
      return res.status(401).json({ error: 'Не авторизован' });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { address: userAddress },
        include: { createdPages: true },
      });

      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      res.status(200).json(user);
    } catch (error) {
      console.error("Ошибка при получении профиля:", error);
      res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Метод ${req.method} не разрешён`);
  }
}

