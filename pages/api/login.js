// pages/api/login.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({ error: 'Адрес кошелька обязателен' });
    }

    try {
      let user = await prisma.user.findUnique({
        where: { address },
      });

      if (!user) {
        user = await prisma.user.create({
          data: { address },
        });
      }

      res.status(200).json({ message: 'Успешный вход', user });
    } catch (error) {
      console.error("Ошибка при логине:", error);
      res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Метод ${req.method} не разрешён`);
  }
}

