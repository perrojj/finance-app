import React, { useState } from 'react';
import { Wallet, LayoutGrid, CreditCard, BarChart3, LogOut } from 'lucide-react';
import PaginaDashboard from './PaginaDashboard'; // <-- Importamos a tela inicial
import PaginaContas from './PaginaContas';       // <-- Importamos a tela de contas

export default function Dashboard({ aoSair, usuarioId }) {
  const [paginaAtiva, setPaginaAtiva] = useState('Dashboard');

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* Topbar (Menu Superior) */}
      <header className="bg-white border-b border-slate-200 px-8 h-20 flex items-center justify-between sticky top-0 z-10">
        
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-2.5 text-blue-600">
            <Wallet size={28} strokeWidth={2.5} />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">FinanceApp</h1>
          </div>

          <nav className="flex items-center gap-2">
            <button 
              onClick={() => setPaginaAtiva('Dashboard')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                paginaAtiva === 'Dashboard' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <LayoutGrid size={18} /> Dashboard
            </button>
            <button 
              onClick={() => setPaginaAtiva('Contas')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                paginaAtiva === 'Contas' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <CreditCard size={18} /> Contas
            </button>
            <button 
              onClick={() => setPaginaAtiva('Relatórios')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                paginaAtiva === 'Relatórios' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BarChart3 size={18} /> Relatórios
            </button>
          </nav>
        </div>

        <button 
          onClick={aoSair}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors"
        >
          <LogOut size={18} /> Sair
        </button>
      </header>

      {/* Conteúdo Dinâmico */}
      <main className="max-w-7xl mx-auto p-8">
        {paginaAtiva === 'Dashboard' && <PaginaDashboard usuarioId={usuarioId} />}
        {paginaAtiva === 'Contas' && <PaginaContas usuarioId={usuarioId} />}
        
        {paginaAtiva === 'Relatórios' && (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <BarChart3 size={48} className="mb-4 text-slate-300" />
            <p>A tela de Relatórios será construída em breve!</p>
          </div>
        )}
      </main>

    </div>
  );
}