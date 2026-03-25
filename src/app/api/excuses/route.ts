import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'gerador-desculpas-super-secret-key';

async function getUserIdFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
}

// GET — lista as desculpas do usuário
export async function GET() {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });

    const excuses = await prisma.excuse.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ excuses });
  } catch (error) {
    console.error('Error fetching excuses:', error);
    return NextResponse.json({ message: 'Erro ao buscar desculpas.' }, { status: 500 });
  }
}

// POST — salva nova desculpa (com prompt opcional)
export async function POST(req: Request) {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });

    const { content, category, prompt } = await req.json();

    if (!content) {
      return NextResponse.json({ message: 'O conteúdo da desculpa é obrigatório.' }, { status: 400 });
    }

    const excuse = await prisma.excuse.create({
      data: {
        content,
        category: category || 'Geral',
        prompt: prompt || null,
        userId,
      },
    });

    return NextResponse.json({ message: 'Desculpa salva com sucesso!', excuse }, { status: 201 });
  } catch (error) {
    console.error('Error saving excuse:', error);
    return NextResponse.json({ message: 'Erro ao salvar desculpa.' }, { status: 500 });
  }
}
