'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Excuse = {
  id: string;
  content: string;
  prompt: string | null;
  category: string | null;
  createdAt: string;
};

// ─── Ícones ─────────────────────────────────────────────────────────────────
const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
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

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

// ─── Componente de linha da tabela ───────────────────────────────────────────
function ExcuseRow({
  excuse,
  onDelete,
}: {
  excuse: Excuse;
  onDelete: (id: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(excuse.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback para navegadores sem clipboard API
      const ta = document.createElement('textarea');
      ta.value = excuse.content;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = async () => {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      // auto-cancela confirmação após 3s
      setTimeout(() => setConfirmingDelete(false), 3000);
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/excuses/${excuse.id}`, { method: 'DELETE' });
      if (res.ok) onDelete(excuse.id);
    } catch {
      // silencia erro de rede
    } finally {
      setDeleting(false);
      setConfirmingDelete(false);
    }
  };

  const categoryColors: Record<string, string> = {
    Trabalho: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    Família:  'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    Encontro: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
    Amigos:   'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    Geral:    'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  };

  const catColor = categoryColors[excuse.category ?? 'Geral'] ?? categoryColors['Geral'];

  return (
    <tr className="border-b border-foreground/5 hover:bg-foreground/[0.03] transition-colors group">
      {/* Data */}
      <td className="py-4 px-4 text-sm text-foreground/50 whitespace-nowrap align-top">
        {new Date(excuse.createdAt).toLocaleDateString('pt-BR', {
          day: '2-digit', month: '2-digit', year: '2-digit',
        })}
      </td>

      {/* Categoria */}
      <td className="py-4 px-4 align-top">
        <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${catColor}`}>
          {excuse.category ?? 'Geral'}
        </span>
      </td>

      {/* Situação/Prompt */}
      <td className="py-4 px-4 text-sm text-foreground/60 align-top max-w-[200px]">
        <p className="line-clamp-3">{excuse.prompt ?? <span className="italic opacity-40">—</span>}</p>
      </td>

      {/* Desculpa */}
      <td className="py-4 px-4 text-sm font-medium align-top max-w-[260px]">
        <p className="line-clamp-3">&ldquo;{excuse.content}&rdquo;</p>
      </td>

      {/* Ações */}
      <td className="py-4 px-4 align-top">
        <div className="flex items-center gap-2">
          {/* Botão copiar */}
          <button
            id={`copy-${excuse.id}`}
            onClick={handleCopy}
            title={copied ? 'Copiado!' : 'Copiar desculpa'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              copied
                ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                : 'bg-foreground/5 hover:bg-foreground/10 text-foreground/60 hover:text-foreground'
            }`}
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
            {copied ? 'Copiado' : 'Copiar'}
          </button>

          {/* Botão excluir */}
          <button
            id={`delete-${excuse.id}`}
            onClick={handleDelete}
            disabled={deleting}
            title={confirmingDelete ? 'Clique novamente para confirmar' : 'Excluir desculpa'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50 ${
              confirmingDelete
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-red-500/10 hover:bg-red-500/20 text-red-500'
            }`}
          >
            <TrashIcon />
            {deleting ? '...' : confirmingDelete ? 'Confirmar?' : 'Excluir'}
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Página principal ────────────────────────────────────────────────────────
export default function ExcusesPage() {
  const [excuses, setExcuses] = useState<Excuse[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [filterCat, setFilterCat] = useState('Todas');
  const router = useRouter();

  useEffect(() => {
    fetchExcuses();
  }, []);

  const fetchExcuses = async () => {
    try {
      const res = await fetch('/api/excuses');
      if (res.status === 401) { router.push('/login'); return; }
      if (res.ok) {
        const data = await res.json();
        setExcuses(data.excuses);
      }
    } catch { /* silencia */ } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setExcuses((prev) => prev.filter((e) => e.id !== id));
  };

  const categories = ['Todas', ...Array.from(new Set(excuses.map((e) => e.category ?? 'Geral')))];

  const filtered = excuses.filter((e) => {
    const matchesCat = filterCat === 'Todas' || e.category === filterCat;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      e.content.toLowerCase().includes(q) ||
      (e.prompt ?? '').toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

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
      {/* Background orbs */}
      <div className="fixed top-20 left-10 w-96 h-96 bg-primary-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />

      <div className="max-w-6xl mx-auto z-10 relative">

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <header className="flex flex-wrap justify-between items-center mb-8 glass p-4 rounded-2xl gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/generator"
              className="flex items-center gap-1.5 text-sm text-foreground/60 hover:text-foreground transition-colors"
            >
              <ArrowLeftIcon /> Voltar ao gerador
            </Link>
            <span className="text-foreground/20">|</span>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-400 dark:to-purple-400">
              🗄️ Minhas Desculpas
            </h1>
          </div>
          <span className="text-sm text-foreground/50">
            {excuses.length} desculpa{excuses.length !== 1 ? 's' : ''} salva{excuses.length !== 1 ? 's' : ''}
          </span>
        </header>

        {/* ── Filtros ───────────────────────────────────────────────────────── */}
        <div className="glass p-4 rounded-2xl mb-6 flex flex-wrap gap-3 items-center">
          {/* Busca */}
          <div className="relative flex-1 min-w-[200px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              id="search-input"
              type="text"
              placeholder="Buscar por desculpa ou situação..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-background/50 border border-foreground/10 rounded-xl text-sm outline-none focus:border-primary-500 transition-colors"
            />
          </div>

          {/* Filtro de categoria */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCat(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  filterCat === cat
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-foreground/5 hover:bg-foreground/10 text-foreground/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tabela ───────────────────────────────────────────────────────── */}
        <div className="glass rounded-2xl overflow-hidden shadow-xl">
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-foreground/40">
              <span className="text-5xl block mb-4">👻</span>
              {excuses.length === 0
                ? <><p className="font-medium">Nenhuma desculpa salva ainda.</p><p className="text-sm mt-1">Gere e salve desculpas no gerador!</p></>
                : <><p className="font-medium">Nenhuma desculpa encontrada.</p><p className="text-sm mt-1">Tente ajustar os filtros.</p></>
              }
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-foreground/10 bg-foreground/[0.02]">
                    <th className="py-3 px-4 text-left text-xs font-semibold text-foreground/50 uppercase tracking-wider">Data</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-foreground/50 uppercase tracking-wider">Categoria</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-foreground/50 uppercase tracking-wider">Situação</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-foreground/50 uppercase tracking-wider">Desculpa</th>
                    <th className="py-3 px-4 text-left text-xs font-semibold text-foreground/50 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((excuse) => (
                    <ExcuseRow key={excuse.id} excuse={excuse} onDelete={handleDelete} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
