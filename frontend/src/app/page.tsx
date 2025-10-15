export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero min-h-[70vh] bg-gradient-to-br from-primary to-secondary">
        <div className="hero-content text-center">
          <div className="max-w-4xl">
            <h1 className="text-6xl font-bold text-primary-content mb-6">
              ACFI
            </h1>
            <h2 className="text-3xl font-semibold text-primary-content mb-4">
              Assistente Consultor Fiscal Inteligente
            </h2>
            <p className="text-lg text-primary-content/90 mb-8 max-w-2xl mx-auto">
              Sistema avançado de consulta ao código tributário com IA, calculadoras especializadas 
              e dashboard completo para análise fiscal.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <span className="badge badge-accent badge-lg rounded-full">RAG + IA</span>
              <span className="badge badge-info badge-lg rounded-full">Código Tributário</span>
              <span className="badge badge-success badge-lg rounded-full">Calculadoras</span>
              <span className="badge badge-warning badge-lg rounded-full">Dashboard</span>
            </div>
            <a href="/codigo-tributario" className="btn btn-accent btn-lg rounded-full">
              Começar Agora
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Features Cards */}
      <section className="py-20 bg-base-200">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">
            Principais Funcionalidades
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Código Tributário */}
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl">
              <div className="card-body text-center">
                <div className="mx-auto mb-6 p-4 bg-primary/10 rounded-full w-fit">
                  <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                  </svg>
                </div>
                <h3 className="card-title text-xl justify-center mb-4">
                  Código Tributário
                </h3>
                <p className="text-base-content/80 mb-6">
                  Consulte informações detalhadas do código tributário com IA. 
                  Perguntas e respostas inteligentes com citações precisas.
                </p>
                <div className="card-actions justify-center">
                  <a href="/codigo-tributario" className="btn btn-primary rounded-full">
                    Consultar Código
                  </a>
                </div>
              </div>
            </div>

            {/* Calculadora */}
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl">
              <div className="card-body text-center">
                <div className="mx-auto mb-6 p-4 bg-success/10 rounded-full w-fit">
                  <svg className="w-12 h-12 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                  </svg>
                </div>
                <h3 className="card-title text-xl justify-center mb-4">
                  Calculadora Fiscal
                </h3>
                <p className="text-base-content/80 mb-6">
                  Compare tributos pré e pós reforma tributária. 
                  Cálculos precisos com diferentes cenários fiscais.
                </p>
                <div className="card-actions justify-center">
                  <button className="btn btn-success rounded-full">
                    Abrir Calculadora
                  </button>
                </div>
              </div>
            </div>

            {/* Dashboard */}
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl">
              <div className="card-body text-center">
                <div className="mx-auto mb-6 p-4 bg-accent/10 rounded-full w-fit">
                  <svg className="w-12 h-12 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 00-2 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                  </svg>
                </div>
                <h3 className="card-title text-xl justify-center mb-4">
                  Dashboard
                </h3>
                <p className="text-base-content/80 mb-6">
                  Visualize análises completas, relatórios e estatísticas 
                  sobre impactos da reforma tributária.
                </p>
                <div className="card-actions justify-center">
                  <button className="btn btn-accent rounded-full">
                    Ver Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">
            Por que usar o ACFI?
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">IA Avançada</h3>
              <p className="text-base-content/70">RAG com citações precisas</p>
            </div>

            <div className="text-center">
              <div className="p-4 bg-success/10 rounded-full w-fit mx-auto mb-4">
                <svg className="w-10 h-10 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">Precisão</h3>
              <p className="text-base-content/70">Cálculos certificados</p>
            </div>

            <div className="text-center">
              <div className="p-4 bg-info/10 rounded-full w-fit mx-auto mb-4">
                <svg className="w-10 h-10 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">Rapidez</h3>
              <p className="text-base-content/70">Respostas instantâneas</p>
            </div>

            <div className="text-center">
              <div className="p-4 bg-accent/10 rounded-full w-fit mx-auto mb-4">
                <svg className="w-10 h-10 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">Confiável</h3>
              <p className="text-base-content/70">Base legal atualizada</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-secondary to-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-secondary-content mb-6">
            Pronto para começar?
          </h2>
          <p className="text-lg text-secondary-content/90 mb-8 max-w-2xl mx-auto">
            Explore o código tributário, compare cenários e tome decisões fiscais informadas 
            com o poder da inteligência artificial.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="/codigo-tributario" className="btn btn-accent btn-lg rounded-full">
              Começar Agora
            </a>
            <button className="btn btn-outline btn-lg rounded-full border-secondary-content text-secondary-content hover:bg-secondary-content hover:text-primary hover:border-secondary-content">
              Saiba Mais
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer footer-center p-10 bg-base-300 rounded-t-3xl">
        <div>
          <h3 className="text-2xl font-bold text-primary">ACFI</h3>
          <p className="text-base-content/80">Assistente de Código Fiscal Inteligente</p>
          <p className="text-sm text-base-content/60">© 2024 ACFI. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}