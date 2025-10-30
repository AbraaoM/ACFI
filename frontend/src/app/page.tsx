'use client';

import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-base-100">
      {/* Hero */}
      <div className="hero min-h-screen bg-gradient-to-br from-primary/20 to-secondary/20">
        <div className="hero-content text-center">
          <div className="max-w-4xl">
            <div className="text-6xl mb-4">🤖</div>
            <h1 className="text-5xl font-bold text-primary mb-4">TRIBUT.AI</h1>
            <p className="text-lg mb-8 text-base-content/80 max-w-2xl mx-auto">
              Sistema de consulta fiscal com inteligência artificial. 
              Faça upload de documentos, converse com a IA e visualize dados.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => router.push('/chat')}
                className="btn btn-primary btn-lg"
              >
                💬 Começar Chat
              </button>
              <button 
                onClick={() => router.push('/base-dados')}
                className="btn btn-outline btn-lg"
              >
                📚 Gerenciar Documentos
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Funcionalidades */}
      <div className="py-20 bg-base-200">
        <div className="container mx-auto px-6 max-w-6xl">
          <h2 className="text-3xl font-bold text-center text-primary mb-12">
            Funcionalidades
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Chat */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body text-center">
                <div className="text-4xl mb-4">💬</div>
                <h3 className="card-title justify-center text-primary">Chat Inteligente</h3>
                <p className="text-base-content/80 mb-4">
                  Converse com a IA sobre questões fiscais e obtenha respostas precisas.
                </p>
                <div className="card-actions justify-center">
                  <button 
                    onClick={() => router.push('/chat')}
                    className="btn btn-primary"
                  >
                    Abrir Chat
                  </button>
                </div>
              </div>
            </div>

            {/* Base de Dados */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body text-center">
                <div className="text-4xl mb-4">📚</div>
                <h3 className="card-title justify-center text-primary">Base de Dados</h3>
                <p className="text-base-content/80 mb-4">
                  Faça upload e gerencie documentos fiscais e legislações.
                </p>
                <div className="card-actions justify-center">
                  <button 
                    onClick={() => router.push('/base-dados')}
                    className="btn btn-secondary"
                  >
                    Gerenciar Dados
                  </button>
                </div>
              </div>
            </div>

            {/* Dashboard */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body text-center">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="card-title justify-center text-primary">Dashboard</h3>
                <p className="text-base-content/80 mb-4">
                  Visualize estatísticas e relatórios dos seus dados.
                </p>
                <div className="card-actions justify-center">
                  <button 
                    onClick={() => router.push('/dashboard')}
                    className="btn btn-accent"
                  >
                    Ver Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Como usar */}
      <div className="py-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <h2 className="text-3xl font-bold text-center text-primary mb-12">
            Como usar
          </h2>
          
          <div className="space-y-8">
            <div className="flex items-center gap-6">
              <div className="badge badge-primary badge-lg p-4 text-xl">1</div>
              <div>
                <h3 className="text-xl font-semibold mb-2">📤 Faça upload dos documentos</h3>
                <p className="text-base-content/80">
                  Envie suas notas fiscais e documentos de legislação fiscal
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="badge badge-secondary badge-lg p-4 text-xl">2</div>
              <div>
                <h3 className="text-xl font-semibold mb-2">💬 Converse com a IA</h3>
                <p className="text-base-content/80">
                  Faça perguntas sobre questões fiscais e obtenha respostas precisas
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="badge badge-accent badge-lg p-4 text-xl">3</div>
              <div>
                <h3 className="text-xl font-semibold mb-2">📊 Visualize os dados</h3>
                <p className="text-base-content/80">
                  Acompanhe estatísticas e insights no dashboard
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-20 bg-primary text-primary-content">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Pronto para começar?</h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Experimente o TRIBUT.AI agora e tenha um assistente fiscal inteligente
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => router.push('/chat')}
              className="btn btn-accent btn-lg"
            >
              Iniciar Chat
            </button>
            <button 
              onClick={() => router.push('/base-dados')}
              className="btn btn-outline btn-lg border-primary-content text-primary-content hover:bg-primary-content hover:text-primary"
            >
              Upload de Documentos
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer footer-center p-10 bg-base-300">
        <div>
          <div className="text-2xl mb-2">🤖</div>
          <p className="font-semibold text-primary">TRIBUT.AI</p>
          <p className="text-sm text-base-content/60">Sistema de consulta fiscal com IA</p>
        </div>
      </footer>
    </div>
  );
}