'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

interface MenuItem {
  name: string
  href: string
  icon: string
  description?: string
}

const menuItems: MenuItem[] = [
  {
    name: 'Home',
    href: '/',
    icon: '🏠',
    description: 'Página inicial'
  },
  {
    name: 'Chat Tributário',
    href: '/codigo-tributario',
    icon: '💬',
    description: 'Assistente para questões tributárias'
  },
  {
    name: 'Documentos',
    href: '/documentos',
    icon: '📄',
    description: 'Gerenciar documentos'
  },
  {
    name: 'Configurações',
    href: '/configuracoes',
    icon: '⚙️',
    description: 'Configurações do sistema'
  },
  {
    name: 'Ajuda',
    href: '/ajuda',
    icon: '❓',
    description: 'Central de ajuda'
  }
]

interface MenuProps {
  collapsed?: boolean
}

export default function Menu({ collapsed = false }: MenuProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(collapsed)

  const toggleMenu = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <div className={`bg-base-200 border-r border-base-300 transition-all duration-300 flex flex-col ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header do Menu */}
      <div className="p-4 border-b border-base-300">
        {!isCollapsed ? (
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-primary">ACFI</h2>
            <button 
              onClick={toggleMenu}
              className="btn btn-ghost btn-sm"
              aria-label="Recolher menu"
            >
              ←
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <button 
              onClick={toggleMenu}
              className="btn btn-ghost btn-sm"
              aria-label="Expandir menu"
            >
              →
            </button>
          </div>
        )}
      </div>

      {/* Lista de Menu */}
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-primary text-primary-content' 
                      : 'hover:bg-base-300 text-base-content'
                  }`}
                  title={isCollapsed ? item.name : item.description}
                >
                  <span className="text-xl flex-shrink-0">{item.icon}</span>
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{item.name}</div>
                      {item.description && (
                        <div className="text-xs opacity-70 truncate">
                          {item.description}
                        </div>
                      )}
                    </div>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer do Menu */}
      {!isCollapsed && (
        <div className="p-4">
          <div className="bg-base-300 rounded-lg p-3 text-sm">
            <div className="font-medium text-primary">Sistema ACFI</div>
            <div className="text-xs opacity-70">
              Assistente de Código Fiscal Inteligente
            </div>
          </div>
        </div>
      )}
    </div>
  )
}