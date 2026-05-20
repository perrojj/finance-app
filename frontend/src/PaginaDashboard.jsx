import React, { useState, useEffect } from 'react';
import { Wallet, ArrowUpRight, ArrowDownRight, Plus, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function PaginaDashboard({ usuarioId }) {
  // Estados para exibir os dados
  const [saldoTotal, setSaldoTotal] = useState(0);
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Estados para o formulário (Dropdowns)
  const [contas, setContas] = useState([]);
  const [categorias, setCategorias] = useState([]);

  // Estados da Janela Modal
  const [modalAberto, setModalAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);

  // Estados dos campos do formulário
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState('saida');
  const [contaId, setContaId] = useState('');
  const [categoriaId, setCategoriaId] = useState('');

  // Função que busca tudo do banco de dados de uma vez
  const carregarDadosDoPainel = async () => {
    try {
      // 1. Busca as contas e calcula o saldo total
      const resContas = await fetch(`http://localhost:8000/api/contas/${usuarioId}`);
      if (resContas.ok) {
        const dadosContas = await resContas.json();
        setContas(dadosContas);
        const soma = dadosContas.reduce((acc, conta) => acc + conta.saldo_atual, 0);
        setSaldoTotal(soma);
        
        // Seleciona a primeira conta como padrão no formulário, se existir
        if (dadosContas.length > 0 && !contaId) setContaId(dadosContas[0].id);
      }

      // 2. Busca as categorias para o formulário
      const resCategorias = await fetch('http://localhost:8000/api/categorias');
      if (resCategorias.ok) {
        const dadosCategorias = await resCategorias.json();
        setCategorias(dadosCategorias);
      }

      // 3. Busca as movimentações reais
      const resMov = await fetch(`http://localhost:8000/api/movimentacoes/usuario/${usuarioId}`);
      if (resMov.ok) {
        const dadosMov = await resMov.json();
        setMovimentacoes(dadosMov);
      }
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
    } finally {
      setCarregando(false);
    }
  };

  // Roda a função acima assim que a tela abre
  useEffect(() => {
    if (usuarioId) carregarDadosDoPainel();
  }, [usuarioId]);

  // Função para enviar nova movimentação
  const handleCriarMovimentacao = async (e) => {
    e.preventDefault();
    setSalvando(true);

    const novaMov = {
      descricao,
      valor: parseFloat(valor.replace(',', '.')),
      tipo,
      conta_id: parseInt(contaId),
      categoria_id: parseInt(categoriaId)
    };

    try {
      const response = await fetch('http://localhost:8000/api/movimentacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novaMov)
      });

      if (response.ok) {
        setModalAberto(false);
        setDescricao(''); setValor(''); // Limpa o form
        carregarDadosDoPainel(); // Recarrega tudo para atualizar saldos e listas!
      }
    } catch (error) {
      console.error("Erro ao salvar movimentação:", error);
    } finally {
      setSalvando(false);
    }
  };

  // Formatadores visuais
  const formatarMoeda = (valorStr) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorStr);
  };

  const formatarData = (dataStr) => {
    const data = new Date(dataStr);
    return data.toLocaleDateString('pt-BR');
  };

  // Filtra categorias no formulário com base no tipo escolhido (entrada ou saída)
  const categoriasFiltradas = categorias.filter(c => c.tipo === tipo);

  return (
    <div className="space-y-6">
      
      {/* Cards Superiores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Saldo Total</CardTitle>
            <Wallet size={18} className="text-blue-500" />
          </CardHeader>
          <CardContent>
            {carregando ? (
              <Loader2 className="h-6 w-6 animate-spin text-slate-400 mt-2" />
            ) : (
              <div className={`text-3xl font-bold tracking-tight ${saldoTotal < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                {formatarMoeda(saldoTotal)}
              </div>
            )}
            <p className="text-xs text-slate-400 mt-1">Todas as contas</p>
          </CardContent>
        </Card>

        {/* Estes dois cards continuam fixos, conectaremos eles na próxima etapa */}
        <Card className="border-slate-200 shadow-sm overflow-hidden opacity-75">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Receitas do Mês</CardTitle>
            <ArrowUpRight size={18} className="text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-green-600">R$ 0,00</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm overflow-hidden opacity-75">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Despesas do Mês</CardTitle>
            <ArrowDownRight size={18} className="text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-red-600">R$ 0,00</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-200 shadow-sm min-h-[400px]">
          <CardHeader><CardTitle className="text-base font-semibold">Gastos por Categoria</CardTitle></CardHeader>
          <CardContent className="flex h-full items-center justify-center text-sm text-slate-400">
            Gráfico em desenvolvimento...
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base font-semibold">Últimas Movimentações</CardTitle>
            
            {/* Modal de Nova Movimentação */}
            <Dialog open={modalAberto} onOpenChange={setModalAberto}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Plus size={16} className="mr-1.5" /> Nova
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Registrar Movimentação</DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleCriarMovimentacao} className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button type="button" variant={tipo === 'entrada' ? 'default' : 'outline'} className={tipo === 'entrada' ? 'bg-green-600 hover:bg-green-700' : ''} onClick={() => setTipo('entrada')}>
                      Receita
                    </Button>
                    <Button type="button" variant={tipo === 'saida' ? 'default' : 'outline'} className={tipo === 'saida' ? 'bg-red-600 hover:bg-red-700' : ''} onClick={() => setTipo('saida')}>
                      Despesa
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Input placeholder="Ex: Supermercado, Salário" value={descricao} onChange={(e) => setDescricao(e.target.value)} required />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Valor</Label>
                      <Input type="number" step="0.01" placeholder="0.00" value={valor} onChange={(e) => setValor(e.target.value)} required />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Conta</Label>
                      <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={contaId} onChange={(e) => setContaId(e.target.value)} required>
                        <option value="">Selecione...</option>
                        {contas.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <select className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} required>
                      <option value="">Selecione a categoria...</option>
                      {categoriasFiltradas.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                  </div>

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 mt-4" disabled={salvando}>
                    {salvando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Registrar'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            {/* Fim do Modal */}

          </CardHeader>
          <CardContent className="space-y-4 pt-4 flex-1 overflow-auto max-h-[400px]">
            {carregando ? (
              <div className="text-center text-slate-500 py-4"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></div>
            ) : movimentacoes.length === 0 ? (
              <div className="text-center text-slate-500 py-8 border border-dashed rounded-xl">Nenhuma movimentação ainda.</div>
            ) : (
              movimentacoes.map((mov) => (
                <div key={mov.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-lg ${mov.tipo === 'entrada' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {mov.tipo === 'entrada' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{mov.descricao}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{formatarData(mov.data)}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${mov.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                    {mov.tipo === 'saida' ? '-' : '+'}{formatarMoeda(mov.valor)}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}