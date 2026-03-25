'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ─── Tipos ──────────────────────────────────────────────────────────────────
type Excuse = {
  id: string;
  content: string;
  category: string;
  createdAt: string;
};

type User = {
  id: string;
  name: string | null;
  email: string;
};

// ─── Templates de desculpas ─────────────────────────────────────────────────
const excuseTemplates: Record<string, string[]> = {
  'Trabalho': [
    'Meu cachorro engoliu o pen drive com a apresentação.',
    'A internet do meu prédio inteiro caiu e o 4G não tem sinal aqui.',
    'Fiquei preso no elevador por 2 horas hoje de manhã.',
    'Tive uma intoxicação alimentar severa no jantar de ontem.',
  ],
  'Família': [
    'Esqueci o celular no silencioso e não ouvi tocar.',
    'Tive que levar o pet ao veterinário de emergência.',
    'Peguei um trânsito impossível por causa de um acidente na via.',
    'Acordei com uma enxaqueca absurda.',
  ],
  'Encontro': [
    'Meu chefe pediu para eu fazer hora extra de última hora.',
    'Estourou um cano na minha cozinha e alagou tudo.',
    'Achei que o nosso encontro era amanhã! Me perdoa.',
    'Minha bateria arriou e meu carro não liga de jeito nenhum.',
  ],
  'Amigos': [
    'Tô muito cansado hoje, tive um dia péssimo no trabalho.',
    'Prometi ajudar minha tia com uma mudança hoje.',
    'Tô meio gripado, melhor não ir para não passar pra vocês.',
    'Estou sem grana esse mês, vou ter que pular essa.',
  ],
  'Geral': [
    'Aconteceu um imprevisto na família, não vou conseguir ir.',
    'Perdi a hora, meu alarme não tocou.',
    'Estou resolvendo um problema pessoal urgente.',
    'Me confundi com as datas.',
  ],
};

// ─── Ícone de usuário ────────────────────────────────────────────────────────
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);

// ─── Componente principal ────────────────────────────────────────────────────
export default function GeneratorPage() {
  const [excuses, setExcuses]           = useState<Excuse[]>([]);
  const [user, setUser]                 = useState<User | null>(null);
  const [loading, setLoading]           = useState(true);
  const [generating, setGenerating]     = useState(false);
  const [category, setCategory]         = useState('Trabalho');
  const [situation, setSituation]       = useState('');
  const [currentExcuse, setCurrentExcuse] = useState('');
  const [generateError, setGenerateError] = useState('');
  const [menuOpen, setMenuOpen]         = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  useEffect(() => {
    fetchData();

    // Fecha o menu ao clicar fora
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchData = async () => {
    try {
      // Busca desculpas e dados do usuário em paralelo
      const [excusesRes, meRes] = await Promise.all([
        fetch('/api/excuses'),
        fetch('/api/auth/me'),
      ]);

      if (excusesRes.status === 401) {
        router.push('/login');
        return;
      }

      if (excusesRes.ok) {
        const data = await excusesRes.json();
        setExcuses(data.excuses);
      }

      if (meRes.ok) {
        const data = await meRes.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!situation.trim() || situation.trim().length < 5) {
      setGenerateError('Descreva sua situação com pelo menos 5 caracteres.');
      return;
    }
    setGenerating(true);
    setCurrentExcuse('');
    setGenerateError('');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situation, category }),
      });

      const data = await res.json();

      if (!res.ok) {
        setGenerateError(data.message || 'Erro ao gerar desculpa.');
      } else {
        setCurrentExcuse(data.excuse);
      }
    } catch {
      setGenerateError('Erro de conexão. Verifique sua internet.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!currentExcuse) return;

    try {
      const res = await fetch('/api/excuses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: currentExcuse,
          category,
          prompt: situation.trim() || null,
        }),
      });

      if (res.ok) {
        fetchData();
        setCurrentExcuse('');
        setSituation('');
      }
    } catch (error) {
      console.error('Error saving excuse:', error);
    }
  };

  const handleLogout = () => {
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/login');
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      const res = await fetch('/api/auth/me', { method: 'DELETE' });
      if (res.ok) {
        router.push('/register');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
    } finally {
      setDeletingAccount(false);
      setShowDeleteModal(false);
    }
  };

  // Exibe o nome ou a parte do email antes do @
  const displayName = user?.name || user?.email?.split('@')[0] || 'Usuário';
  const initials = displayName.slice(0, 2).toUpperCase();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-primary-600 dark:text-primary-400 animate-pulse font-medium">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Carregando...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative p-4 md:p-8">
      {/* Background Orbs */}
      <div className="fixed top-20 left-10 w-96 h-96 bg-primary-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />

      <div className="max-w-6xl mx-auto z-10 relative">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="flex justify-between items-center mb-10 glass p-4 rounded-2xl">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-400 dark:to-purple-400">
            🎭 Gerador de Desculpas
          </h1>

          <div className="flex items-center gap-3">
            {/* Botão de logout */}
            <button
              id="logout-button"
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
            >
              Sair da Conta
            </button>

            {/* Identificação do usuário com dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                id="user-menu-button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 transition-all group"
                aria-haspopup="true"
                aria-expanded={menuOpen}
              >
                {/* Avatar com iniciais */}
                <span className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {initials}
                </span>
                <span className="text-sm font-medium max-w-[120px] truncate hidden sm:block">
                  {displayName}
                </span>
                <span className={`text-foreground/50 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}>
                  <ChevronDownIcon />
                </span>
              </button>

              {/* Dropdown menu */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 border border-foreground/10 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                  {/* Info do usuário */}
                  <div className="px-4 py-3 border-b border-foreground/10">
                    <div className="flex items-center gap-2 mb-0.5">
                      <UserIcon />
                      <p className="text-sm font-semibold truncate">{displayName}</p>
                    </div>
                    <p className="text-xs text-foreground/50 truncate pl-[22px]">{user?.email}</p>
                  </div>

                  <div className="p-1.5 space-y-0.5">
                    {/* Link para gerenciar desculpas */}
                    <Link
                      href="/excuses"
                      id="manage-excuses-link"
                      onClick={() => setMenuOpen(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-foreground/5 rounded-lg transition-colors font-medium"
                    >
                      <span className="text-base">🗄️</span>
                      Minhas Desculpas
                    </Link>

                    {/* Opção de excluir conta */}
                    <button
                      id="delete-account-button"
                      onClick={() => { setMenuOpen(false); setShowDeleteModal(true); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors font-medium"
                    >
                      <TrashIcon />
                      Excluir minha conta
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── Conteúdo principal ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Painel Gerador */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass p-8 rounded-3xl shadow-xl">
              <h2 className="text-xl font-bold mb-6">Criar Nova Desculpa</h2>

              {/* Campo de situação */}
              <div className="mb-6">
                <label htmlFor="situation-input" className="block text-sm font-medium mb-2 opacity-80">
                  Descreva sua situação <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="situation-input"
                  value={situation}
                  onChange={(e) => { setSituation(e.target.value); setGenerateError(''); }}
                  placeholder="Ex: Preciso faltar ao trabalho amanhã pois combinei um compromisso que esqueci de cancelar..."
                  rows={3}
                  className="w-full bg-background/50 border border-foreground/10 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 rounded-xl px-4 py-3 text-sm resize-none transition-all outline-none"
                />
                {generateError && (
                  <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                    <span>⚠️</span> {generateError}
                  </p>
                )}
              </div>

              {/* Selector de categoria */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 opacity-80">Contexto/Categoria</label>
                <div className="flex flex-wrap gap-2">
                  {['Trabalho', 'Família', 'Encontro', 'Amigos', 'Geral'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        category === cat
                          ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                          : 'bg-foreground/5 hover:bg-foreground/10 text-foreground/70'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="min-h-[150px] bg-background/50 border border-foreground/5 rounded-2xl p-6 mb-6 flex items-center justify-center text-center relative overflow-hidden transition-all">
                {generating ? (
                  <div className="flex flex-col items-center gap-3 text-primary-600 dark:text-primary-400">
                    <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-sm font-medium animate-pulse">A IA está criando sua desculpa perfeita...</span>
                  </div>
                ) : currentExcuse ? (
                  <div className="space-y-3">
                    <span className="text-3xl">✨</span>
                    <p className="text-xl md:text-2xl font-medium leading-relaxed">
                      &ldquo;{currentExcuse}&rdquo;
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 text-foreground/40">
                    <span className="text-3xl">🤖</span>
                    <p className="italic text-sm">Descreva sua situação acima e clique em Gerar para a IA criar uma desculpa personalizada.</p>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  id="generate-button"
                  onClick={handleGenerate}
                  disabled={generating || !situation.trim()}
                  className="flex-1 py-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all shadow-lg shadow-primary-500/30 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <span className="text-xl">{generating ? '⌛' : '🤖'}</span>
                  {generating ? 'Gerando...' : 'Gerar com IA'}
                </button>

                <button
                  id="save-button"
                  onClick={handleSave}
                  disabled={!currentExcuse || generating}
                  className="px-6 py-4 bg-foreground/5 hover:bg-foreground/10 text-foreground rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-foreground/10 active:scale-[0.98]"
                  title="Salvar no meu cofre"
                >
                  💾 Salvar
                </button>
              </div>
            </div>
          </div>

          {/* Painel do Cofre */}
          <div className="lg:col-span-1">
            <div className="glass p-6 rounded-3xl h-full max-h-[800px] overflow-hidden flex flex-col">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-foreground/10 pb-4">
                <span>🗄️</span> Seu Cofre
              </h2>

              <div className="flex-1 overflow-y-auto pr-2 space-y-4 pt-2 custom-scrollbar">
                {excuses.length === 0 ? (
                  <div className="text-center p-6 bg-foreground/5 rounded-xl border border-foreground/5 h-full flex flex-col items-center justify-center text-foreground/50">
                    <span className="text-4xl mb-3">👻</span>
                    <p>Seu cofre está vazio.</p>
                    <p className="text-sm">Gere e salve suas desculpas para tê-las sempre em mãos.</p>
                  </div>
                ) : (
                  excuses.map((excuse) => (
                    <div key={excuse.id} className="p-4 bg-background/60 hover:bg-background/80 rounded-xl border border-foreground/5 transition-colors group">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-semibold px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-md">
                          {excuse.category}
                        </span>
                        <span className="text-xs text-foreground/40">
                          {new Date(excuse.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm font-medium leading-relaxed">
                        "{excuse.content}"
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Modal de confirmação de exclusão ──────────────────────────────── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !deletingAccount && setShowDeleteModal(false)}
          />

          {/* Card do modal */}
          <div className="relative z-10 w-full max-w-sm glass rounded-2xl p-6 shadow-2xl border border-foreground/10">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                <TrashIcon />
              </div>
              <h2 className="text-xl font-bold mb-2">Excluir conta?</h2>
              <p className="text-sm text-foreground/60">
                Esta ação é <strong className="text-foreground">irreversível</strong>. Todos os seus dados e desculpas salvas serão permanentemente excluídos.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deletingAccount}
                className="flex-1 py-2.5 px-4 bg-foreground/5 hover:bg-foreground/10 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                id="confirm-delete-button"
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-red-500/30 disabled:opacity-70"
              >
                {deletingAccount ? 'Excluindo...' : 'Sim, excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
