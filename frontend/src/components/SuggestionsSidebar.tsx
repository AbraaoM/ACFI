"use client";

interface SuggestionsSidebarProps {
  onSuggestionClick: (suggestion: string) => void;
}

export default function SuggestionsSidebar({ onSuggestionClick }: SuggestionsSidebarProps) {
  const suggestions = [
    {
      category: 'ICMS',
      title: 'Como calcular ICMS sobre vendas interestaduais?',
      color: 'primary'
    },
    {
      category: 'IPI',
      title: 'Quais produtos são isentos de IPI?',
      color: 'success'
    },
    {
      category: 'Simples Nacional',
      title: 'Limites de faturamento para Simples Nacional em 2024',
      color: 'accent'
    },
    {
      category: 'IRPF',
      title: 'Quais são as deduções permitidas na declaração de IRPF?',
      color: 'info'
    },
    {
      category: 'PIS/COFINS',
      title: 'Como calcular PIS e COFINS no regime cumulativo?',
      color: 'warning'
    },
    {
      category: 'ISS',
      title: 'Alíquotas de ISS para serviços de tecnologia',
      color: 'secondary'
    }
  ];

  const features = [
    'Citações legais precisas',
    'Base legal atualizada',
    'Respostas contextualizadas',
    'Análise jurisprudencial',
    'Cálculos tributários',
    'Orientações práticas'
  ];

  return (
    <div className="w-80 bg-base-100 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <h2 className="text-lg font-semibold text-base-content">Sugestões de Consulta</h2>
      </div>
      
      <div className="space-y-3 mb-8">
        {suggestions.map((suggestion, index) => (
          <button 
            key={index}
            className={`w-full text-left p-3 bg-${suggestion.color}/5 hover:bg-${suggestion.color}/10 rounded-xl transition-all duration-200 border border-transparent hover:border-${suggestion.color}/20`}
            onClick={() => onSuggestionClick(suggestion.title)}
          >
            <div className={`font-medium text-sm text-${suggestion.color} mb-1`}>
              {suggestion.category}
            </div>
            <div className="text-xs text-base-content/70 leading-relaxed">
              {suggestion.title}
            </div>
          </button>
        ))}
      </div>

      <div className="border-t border-base-300 pt-6">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h3 className="text-md font-semibold text-base-content">Recursos</h3>
        </div>
        
        <div className="space-y-2">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-base-content/70">
              <svg className="w-4 h-4 text-success flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>{feature}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-accent/5 rounded-xl">
          <div className="text-xs text-accent font-medium mb-1">💡 Dica</div>
          <div className="text-xs text-base-content/70">
            Seja específico em suas perguntas para obter respostas mais precisas e relevantes.
          </div>
        </div>
      </div>
    </div>
  );
}