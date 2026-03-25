import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Background Orbs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      
      {/* Navigation */}
      <nav className="w-full z-50 glass border-b-0 sticky top-0 px-6 py-4 flex justify-between items-center max-w-7xl mx-auto rounded-b-2xl mb-8">
        <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-400 dark:to-purple-400 flex items-center gap-2">
          <span>🎭</span> Gerador de Desculpas
        </div>
        <div className="flex gap-4">
          <Link href="/login" className="px-5 py-2 text-sm font-medium hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            Entrar
          </Link>
          <Link href="/register" className="px-5 py-2 text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white rounded-full transition-all shadow-lg shadow-primary-500/30">
            Começar Grátis
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center z-10 px-4 text-center pb-20">
        <div className="inline-block mb-4 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium border border-primary-200 dark:border-primary-800">
          ✨ Crie desculpas infalíveis em segundos
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl mx-auto">
          Nunca mais fique sem o que dizer quando
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-purple-500 mt-2">
            precisar de uma saída mestra.
          </span>
        </h1>
        
        <p className="mt-6 text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto mb-10">
          Você já esteve em uma situação onde precisava cancelar um compromisso, mas não sabia o que falar? Use inteligência e criatividade ao seu favor.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href="/register" className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-full font-bold text-lg transition-all shadow-xl shadow-primary-500/30 hover:-translate-y-1 transform">
            Gerar Minha Primeira Desculpa
          </Link>
          <Link href="#como-funciona" className="px-8 py-4 glass hover:bg-white/10 dark:hover:bg-black/10 rounded-full font-bold text-lg transition-all border border-foreground/10">
            Como Funciona?
          </Link>
        </div>

        {/* Feature Cards Showcase */}
        <div id="como-funciona" className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mt-32 px-4">
          <div className="glass p-8 rounded-3xl relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="text-8xl">🚀</span>
            </div>
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/50 rounded-2xl flex items-center justify-center mb-6 text-2xl">
              1️⃣
            </div>
            <h3 className="text-xl font-bold mb-3">Escolha o Contexto</h3>
            <p className="text-foreground/70">Trabalho, Família, Encontro, Amigos... Selecione com quem você precisa se justificar.</p>
          </div>

          <div className="glass p-8 rounded-3xl relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300 mt-0 md:mt-8">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="text-8xl">🎯</span>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-2xl flex items-center justify-center mb-6 text-2xl">
              2️⃣
            </div>
            <h3 className="text-xl font-bold mb-3">Gere a Desculpa</h3>
            <p className="text-foreground/70">Nosso sistema cria uma justificativa coerente, quase irrefutável e altamente criativa.</p>
          </div>

          <div className="glass p-8 rounded-3xl relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300 mt-0 md:mt-16">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="text-8xl">💾</span>
            </div>
            <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/50 rounded-2xl flex items-center justify-center mb-6 text-2xl">
              3️⃣
            </div>
            <h3 className="text-xl font-bold mb-3">Salve no Cofre</h3>
            <p className="text-foreground/70">Crie sua conta e salve suas melhores desculpas para nunca usá-las duas vezes com a mesma pessoa.</p>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="z-10 py-8 border-t border-foreground/10 text-center text-sm text-foreground/50 mt-auto">
        <p>&copy; {new Date().getFullYear()} Gerador de Desculpas. Todos os direitos de esquivar-se são reservados.</p>
      </footer>
    </div>
  );
}
