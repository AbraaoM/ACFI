import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-acfi-neutral to-base-200">
      {/* Header */}
      <div className="acfi-header shadow-lg">
        <div className="navbar container mx-auto">
          <div className="navbar-start">
            <div className="text-xl font-bold text-acfi-light">ACFI</div>
          </div>
          <div className="navbar-end">
            <button className="acfi-button-primary btn-sm">Entrar</button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="hero min-h-[60vh] bg-gradient-to-r from-acfi-primary to-acfi-secondary">
        <div className="hero-content text-center max-w-4xl">
          <div className="acfi-fade-in">
            <h1 className="text-6xl font-bold mb-6 text-acfi-light">
              <span className="text-acfi-secondary drop-shadow-lg">ACFI</span>
            </h1>
            <h2 className="text-3xl font-semibold mb-4 text-acfi-light">
              Assistente de Código Fiscal Inteligente
            </h2>
            <p className="text-lg text-acfi-light opacity-90 max-w-2xl mx-auto mb-8">
              Sistema avançado de consulta ao código tributário com IA, calculadoras especializadas
              e dashboard completo para análise fiscal pré e pós reforma tributária.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <div className="badge bg-acfi-secondary text-acfi-light border-none badge-lg">RAG + IA</div>
              <div className="badge bg-acfi-success text-acfi-light border-none badge-lg">Código Tributário</div>
              <div className="badge bg-acfi-alert text-acfi-light border-none badge-lg">Calculadoras</div>
              <div className="badge bg-acfi-primary text-acfi-light border-none badge-lg">Dashboard</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Features */}
      <div className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12 text-acfi-primary">Principais Funcionalidades</h3>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Código Tributário */}
          <div className="acfi-card acfi-hover-lift">
            <div className="card-body text-center">
              <div className="mx-auto mb-4 p-4 bg-acfi-secondary bg-opacity-10 rounded-full w-fit">
                <svg className="w-12 h-12 text-acfi-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                </svg>
              </div>
              <h4 className="card-title text-xl justify-center mb-2 text-acfi-primary">Código Tributário</h4>
              <p className="text-acfi-dark mb-6">
                Consulte informações detalhadas do código tributário com IA.
                Perguntas e respostas inteligentes com citações precisas.
              </p>
              <div className="card-actions justify-center">
                <button className="acfi-button-primary">
                  Consultar Código
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Calculadora */}
          <div className="acfi-card acfi-hover-lift">
            <div className="card-body text-center">
              <div className="mx-auto mb-4 p-4 bg-acfi-success bg-opacity-10 rounded-full w-fit">
                <svg className="w-12 h-12 text-acfi-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                </svg>
              </div>
              <h4 className="card-title text-xl justify-center mb-2 text-acfi-primary">Calculadora Fiscal</h4>
              <p className="text-acfi-dark mb-6">
                Compare tributos pré e pós reforma tributária.
                Cálculos precisos com diferentes cenários fiscais.
              </p>
              <div className="card-actions justify-center">
                <button className="btn bg-acfi-success border-acfi-success text-acfi-light hover:bg-opacity-80">
                  Abrir Calculadora
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Dashboard */}
          <div className="acfi-card acfi-hover-lift">
            <div className="card-body text-center">
              <div className="mx-auto mb-4 p-4 bg-acfi-alert bg-opacity-10 rounded-full w-fit">
                <svg className="w-12 h-12 text-acfi-alert" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 00-2 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                </svg>
              </div>
              <h4 className="card-title text-xl justify-center mb-2 text-acfi-primary">Dashboard</h4>
              <p className="text-acfi-dark mb-6">
                Visualize análises completas, relatórios e estatísticas
                sobre impactos da reforma tributária.
              </p>
              <div className="card-actions justify-center">
                <button className="acfi-button-secondary">
                  Ver Dashboard
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Summary */}
      <div className="bg-base-200 py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12 text-acfi-primary">Por que usar o ACFI?</h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="text-center acfi-fade-in">
              <div className="p-3 bg-acfi-secondary bg-opacity-10 rounded-full w-fit mx-auto mb-4">
                <svg className="w-8 h-8 text-acfi-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <h4 className="font-semibold mb-2 text-acfi-primary">IA Avançada</h4>
              <p className="text-sm text-acfi-dark">RAG com citações precisas</p>
            </div>

            <div className="text-center acfi-fade-in">
              <div className="p-3 bg-acfi-success bg-opacity-10 rounded-full w-fit mx-auto mb-4">
                <svg className="w-8 h-8 text-acfi-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h4 className="font-semibold mb-2 text-acfi-primary">Precisão</h4>
              <p className="text-sm text-acfi-dark">Cálculos certificados</p>
            </div>

            <div className="text-center acfi-fade-in">
              <div className="p-3 bg-acfi-secondary bg-opacity-10 rounded-full w-fit mx-auto mb-4">
                <svg className="w-8 h-8 text-acfi-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h4 className="font-semibold mb-2 text-acfi-primary">Rapidez</h4>
              <p className="text-sm text-acfi-dark">Respostas instantâneas</p>
            </div>

            <div className="text-center acfi-fade-in">
              <div className="p-3 bg-acfi-primary bg-opacity-10 rounded-full w-fit mx-auto mb-4">
                <svg className="w-8 h-8 text-acfi-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
              </div>
              <h4 className="font-semibold mb-2 text-acfi-primary">Confiável</h4>
              <p className="text-sm text-acfi-dark">Base legal atualizada</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-acfi-primary to-acfi-secondary">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-6 text-acfi-light">Pronto para começar?</h3>
          <p className="text-lg text-acfi-light opacity-90 mb-8 max-w-2xl mx-auto">
            Explore o código tributário, compare cenários e tome decisões fiscais informadas
            com o poder da inteligência artificial.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button className="btn btn-lg bg-acfi-light text-acfi-primary border-acfi-light hover:bg-opacity-90">
              Começar Agora
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
            </button>
            <button className="btn btn-outline btn-lg border-acfi-light text-acfi-light hover:bg-acfi-light hover:text-acfi-primary">
              Saiba Mais
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer footer-center p-10 acfi-header">
        <div>
          <div className="text-2xl font-bold text-acfi-light">ACFI</div>
          <p className="text-acfi-light opacity-80">Assistente de Código Fiscal Inteligente</p>
          <p className="text-sm text-acfi-light opacity-60">© 2024 ACFI. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
