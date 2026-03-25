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

// DELETE /api/excuses/[id]
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromToken();
    if (!userId) return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });

    const { id } = await params;

    // Garante que a desculpa pertence ao usuário autenticado
    const excuse = await prisma.excuse.findUnique({ where: { id } });

    if (!excuse) {
      return NextResponse.json({ message: 'Desculpa não encontrada.' }, { status: 404 });
    }

    if (excuse.userId !== userId) {
      return NextResponse.json({ message: 'Sem permissão.' }, { status: 403 });
    }

    await prisma.excuse.delete({ where: { id } });

    return NextResponse.json({ message: 'Desculpa excluída com sucesso.' });
  } catch (error) {
    console.error('Error deleting excuse:', error);
    return NextResponse.json({ message: 'Erro ao excluir desculpa.' }, { status: 500 });
  }
}
