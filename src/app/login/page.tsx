'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccessMsg('Conta criada com sucesso! Faça login para continuar.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Erro ao fazer login.');
      }

      // Redireciona para o gerador de desculpas
      router.push('/generator');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Círculos de Background com Blur */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="z-10 w-full max-w-md p-8 glass rounded-2xl shadow-2xl mx-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-400 dark:to-purple-400">
            Bem-vindo de volta!
          </h1>
          <p className="text-sm mt-2 text-foreground/70">Faça login para salvar suas melhores desculpas.</p>
        </div>

        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-green-100 border border-green-200 text-green-700 text-sm text-center">
            {successMsg}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-100 border border-red-200 text-red-700 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-background/50 border border-foreground/10 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder:text-foreground/40"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 bg-background/50 border border-foreground/10 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder:text-foreground/40"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-primary-500/30 disabled:opacity-70"
          >
            {loading ? 'Autenticando...' : 'Entrar'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-foreground/70">
          Ainda não tem conta?{' '}
          <Link href="/register" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando formulário...</div>}>
      <LoginForm />
    </Suspense>
  );
}
