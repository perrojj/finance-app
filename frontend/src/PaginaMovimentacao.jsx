import React, { useState } from 'react';
import { Plus, Repeat, CalendarDays, Wallet, ClipboardList, Trash2, Edit3 } from 'lucide-react';

export default function PaginaMovimentacao() {
  const [filtroStatus, setFiltroStatus] = useState('Entradas e Saídas');

  const movimentacoes = [
    { id: 1, descricao: "Compras Supermercado", tipo: "Saída", valor: "R$ 450,80", status: "Pago" },
    { id: 2, descricao: "Mensalidade Academia", tipo: "Saída", valor: "R$ 130,00", status: "Pago" },
    { id: 3, descricao: "Venda Freelancer", tipo: "Entrada", valor: "R$ 2.500,00", status: "Pendente" },
    { id: 4, descricao: "Conta de Energia", tipo: "Saída", valor: "R$ 180,55", status: "Pago" },
    { id: 5, descricao: "Compras Online (Amazon)", tipo: "Saída", valor: "R$ 325,10", status: "Pendente" },
    { id: 6, descricao: "Salário Mensal", tipo: "Entrada", valor: "R$ 7.800,00", status: "Pago" },
    { id: 7, descricao: "Parc. Notebook", tipo: "Saída", valor: "R$ 850,00", status: "Atrasado" }
  ];

  return (
    <div className="flex flex-col gap-8">
      
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2.5">
          <Repeat size={22} className="text-blue-600" />
          Movimentação
        </h3>
        <button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2.5 px-6 py-3 rounded-lg font-medium shadow-sm transition-colors text-sm">
          <Plus size={20} />
          Adicionar Movimentação
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.02)] p-7 border border-gray-100 flex flex-col gap-6">
        <h4 className="font-semibold text-gray-800 text-base">Filtrar Por:</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          
          <div className="md:col-span-1 space-y-3">
            {['Entradas e Saídas', 'Entradas', 'Saídas'].map(item => (
              <label key={item} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="filtroTipo"
                  value={item}
                  checked={filtroStatus === item}
                  onChange={() => setFiltroStatus(item)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm text-gray-700">{item}</span>
              </label>
            ))}
          </div>

          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Período De:</label>
              <div className="relative">
                <input type="date" className="w-full text-sm border border-gray-200 rounded-lg p-3 bg-gray-50 text-gray-700" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Até:</label>
              <div className="relative">
                <input type="date" className="w-full text-sm border border-gray-200 rounded-lg p-3 bg-gray-50 text-gray-700" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Contas:</label>
              <select className="w-full text-sm border border-gray-200 rounded-lg p-3 bg-gray-50 text-gray-700">
                <option>Selecione uma conta...</option>
              </select>
            </div>
          </div>
        </div>

        <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg text-sm font-medium transition-colors">
          Limpar Filtros
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.02)] border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr className="text-xs text-gray-500 font-medium tracking-wider uppercase">
              <th className="px-8 py-4">Descrição</th>
              <th className="px-6 py-4">Tipo</th>
              <th className="px-6 py-4">Valor</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-8 py-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm text-gray-800">
            {movimentacoes.map(mov => (
              <tr key={mov.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-8 py-5 font-medium">{mov.descricao}</td>
                <td className="px-6 py-5">
                  <span className={`flex items-center gap-1.5 ${mov.tipo === 'Entrada' ? 'text-green-600' : 'text-red-600'}`}>
                    <ClipboardList size={16} />
                    {mov.tipo}
                  </span>
                </td>
                <td className="px-6 py-5 font-bold">{mov.valor}</td>
                <td className="px-6 py-5">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    mov.status === 'Pago' ? 'bg-green-100 text-green-700' :
                    mov.status === 'Pendente' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {mov.status}
                  </span>
                </td>
                <td className="px-8 py-5 text-center flex items-center justify-center gap-2">
                  <button className="text-gray-400 hover:text-blue-600 p-1.5 rounded"><Edit3 size={17}/></button>
                  <button className="text-gray-400 hover:text-red-600 p-1.5 rounded"><Trash2 size={17}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}