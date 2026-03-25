export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'gerador-desculpas-super-secret-key';

async function getUserIdFromToken(): Promise<string | null> {
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

// GET /api/auth/me — retorna nome e email do usuário logado
export async function GET() {
  const userId = await getUserIdFromToken();
  if (!userId) {
    return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  });

  if (!user) {
    return NextResponse.json({ message: 'Usuário não encontrado.' }, { status: 404 });
  }

  return NextResponse.json({ user });
}

// DELETE /api/auth/me — exclui a conta do usuário logado
export async function DELETE() {
  const userId = await getUserIdFromToken();
  if (!userId) {
    return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  }

  await prisma.user.delete({ where: { id: userId } });

  // Apaga o cookie de autenticação
  const cookieStore = await cookies();
  cookieStore.set({
    name: 'auth_token',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });

  return NextResponse.json({ message: 'Conta excluída com sucesso.' }, { status: 200 });
}
