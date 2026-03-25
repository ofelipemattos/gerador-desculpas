'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ─── Ícones inline para não depender de lib ────────────────────────────────
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ─── Validação de e-mail ─────────────────────────────────────────────────────
const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

const validateEmail = (v: string): string | null => {
  if (!v) return 'O e-mail é obrigatório.';
  if (!EMAIL_REGEX.test(v)) return 'Informe um e-mail válido (ex: nome@dominio.com).';
  return null;
};

// ─── Regras de validação da senha ──────────────────────────────────────────
interface PasswordRule {
  label: string;
  test: (v: string) => boolean;
}

const passwordRules: PasswordRule[] = [
  { label: 'Pelo menos 8 caracteres',      test: (v) => v.length >= 8 },
  { label: 'Pelo menos 1 número',          test: (v) => /\d/.test(v) },
  { label: 'Pelo menos 1 caractere especial', test: (v) => /[^a-zA-Z0-9]/.test(v) },
  { label: 'Sem espaços ou tabulações',    test: (v) => !/[\s\t]/.test(v) },
];

const validatePassword = (v: string): string | null => {
  if (/[\s\t]/.test(v)) return 'A senha não pode conter espaços ou tabulações.';
  if (v.length < 8)      return 'A senha deve ter pelo menos 8 caracteres.';
  if (!/\d/.test(v))     return 'A senha deve conter pelo menos 1 número.';
  if (!/[^a-zA-Z0-9]/.test(v)) return 'A senha deve conter pelo menos 1 caractere especial.';
  return null;
};

// ─── Componente ────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const [name, setName]                   = useState('');
  const [email, setEmail]                 = useState('');
  const [emailTouched, setEmailTouched]   = useState(false);
  const [password, setPassword]           = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword]   = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [error, setError]                 = useState('');
  const [loading, setLoading]             = useState(false);
  const router = useRouter();

  const emailError      = emailTouched ? validateEmail(email) : null;
  const passwordError   = passwordTouched ? validatePassword(password) : null;
  const confirmError    = confirmPassword && password !== confirmPassword
    ? 'As senhas não coincidem.' : null;
  const allRulesMet     = passwordRules.every((r) => r.test(password));
  const formValid       = !validateEmail(email) && allRulesMet && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordTouched(true);
    setEmailTouched(true);

    const emailErr = validateEmail(email);
    if (emailErr) { setError(emailErr); return; }
    const pwdErr = validatePassword(password);
    if (pwdErr) { setError(pwdErr); return; }
    if (password !== confirmPassword) { setError('As senhas não coincidem.'); return; }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Erro ao registrar.');
      }

      // ✅ Vai direto para o gerador (dashboard) após criar a conta
      router.push('/generator');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden py-10">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
      <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />

      <div className="z-10 w-full max-w-md p-8 glass rounded-2xl shadow-2xl mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-400 dark:to-purple-400">
            Criar Conta
          </h1>
          <p className="text-sm mt-2 text-foreground/70">
            Junte-se para gerar as melhores desculpas!
          </p>
        </div>

        {/* Erro global */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-100 border border-red-200 text-red-700 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nome */}
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="name">
              Nome <span className="text-foreground/40 text-xs">(Opcional)</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-background/50 border border-foreground/10 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder:text-foreground/40"
              placeholder="Seu nome"
            />
          </div>

          {/* E-mail */}
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (emailTouched) setEmailTouched(true); }}
              onBlur={() => setEmailTouched(true)}
              required
              className={`w-full px-4 py-2 bg-background/50 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder:text-foreground/40 ${
                emailError ? 'border-red-400' : 'border-foreground/10'
              }`}
              placeholder="seu@email.com"
            />
            {emailError && (
              <p className="mt-1 text-xs text-red-500">{emailError}</p>
            )}
          </div>

          {/* Senha */}
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="password">
              Senha
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setPasswordTouched(true); }}
                required
                className={`w-full px-4 py-2 pr-11 bg-background/50 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder:text-foreground/40 ${
                  passwordError ? 'border-red-400' : 'border-foreground/10'
                }`}
                placeholder="Mínimo 8 caracteres"
              />
              <button
                type="button"
                id="toggle-password"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/80 transition-colors"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            {/* Indicadores de regras — aparecem assim que o usuário começa a digitar */}
            {passwordTouched && (
              <ul className="mt-2 space-y-1">
                {passwordRules.map((rule) => {
                  const ok = rule.test(password);
                  return (
                    <li key={rule.label}
                      className={`flex items-center gap-1.5 text-xs transition-colors ${
                        ok ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'
                      }`}
                    >
                      <span className="flex-shrink-0">
                        {ok ? <CheckIcon /> : <XIcon />}
                      </span>
                      {rule.label}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Confirmação de senha */}
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="confirm-password">
              Confirmar Senha
            </label>
            <div className="relative">
              <input
                id="confirm-password"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={`w-full px-4 py-2 pr-11 bg-background/50 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder:text-foreground/40 ${
                  confirmError ? 'border-red-400' : 'border-foreground/10'
                }`}
                placeholder="Repita a senha"
              />
              <button
                type="button"
                id="toggle-confirm-password"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/80 transition-colors"
                aria-label={showConfirm ? 'Ocultar confirmação' : 'Mostrar confirmação'}
              >
                {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {confirmError && (
              <p className="mt-1 text-xs text-red-500">{confirmError}</p>
            )}
          </div>

          {/* Botão */}
          <button
            type="submit"
            id="register-submit"
            disabled={loading || !formValid}
            className="w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Criando conta...' : 'Registrar'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-foreground/70">
          Já tem uma conta?{' '}
          <Link href="/login" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
