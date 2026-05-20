import React, { useState, useEffect } from 'react';
import { Plus, Building2, Wallet, CreditCard, MoreHorizontal, Loader2, Trash2, Edit3 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function PaginaContas({ usuarioId }) {
  const [contas, setContas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  
  // Estados para CRIAR conta
  const [modalAberto, setModalAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [nomeConta, setNomeConta] = useState('');
  const [tipoConta, setTipoConta] = useState('Corrente');
  const [saldoConta, setSaldoConta] = useState('');

  // Estados para EXCLUIR conta
  const [contaParaExcluir, setContaParaExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);

  // Estados para EDITAR conta (NOVO)
  const [modalEdicaoAberto, setModalEdicaoAberto] = useState(false);
  const [contaEditandoId, setContaEditandoId] = useState(null);
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);
  const [editNome, setEditNome] = useState('');
  const [editTipo, setEditTipo] = useState('');
  const [editSaldo, setEditSaldo] = useState('');

  const buscarContas = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/contas/${usuarioId}`);
      if (response.ok) {
        const data = await response.json();
        setContas(data);
      }
    } catch (error) {
      console.error("Erro ao buscar contas:", error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (usuarioId) buscarContas();
  }, [usuarioId]);

  // Função de CRIAR
  const handleCriarConta = async (e) => {
    e.preventDefault();
    setSalvando(true);
    const novaConta = {
      nome: nomeConta,
      tipo: tipoConta,
      saldo_atual: parseFloat(saldoConta.replace(',', '.')),
      usuario_id: usuarioId
    };

    try {
      const response = await fetch('http://localhost:8000/api/contas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novaConta)
      });
      if (response.ok) {
        setModalAberto(false);
        setNomeConta(''); setTipoConta('Corrente'); setSaldoConta('');
        buscarContas();
      }
    } catch (error) {
      console.error("Erro ao salvar conta:", error);
    } finally {
      setSalvando(false);
    }
  };

  // Função de EXCLUIR
  const handleExcluirConta = async () => {
    if (!contaParaExcluir) return;
    setExcluindo(true);
    try {
      const response = await fetch(`http://localhost:8000/api/contas/${contaParaExcluir}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        buscarContas();
        setContaParaExcluir(null);
      }
    } catch (error) {
      console.error("Erro ao excluir conta:", error);
    } finally {
      setExcluindo(false);
    }
  };

  // Funções de EDITAR (NOVO)
  const abrirModalEdicao = (conta) => {
    setContaEditandoId(conta.id);
    setEditNome(conta.nome);
    setEditTipo(conta.tipo);
    setEditSaldo(conta.saldo_atual.toString());
    setModalEdicaoAberto(true);
  };

  const handleSalvarEdicao = async (e) => {
    e.preventDefault();
    setSalvandoEdicao(true);
    
    const contaAtualizada = {
      nome: editNome,
      tipo: editTipo,
      saldo_atual: parseFloat(editSaldo.toString().replace(',', '.')),
    };

    try {
      const response = await fetch(`http://localhost:8000/api/contas/${contaEditandoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contaAtualizada)
      });
      
      if (response.ok) {
        setModalEdicaoAberto(false);
        buscarContas(); // Puxa os dados atualizados
      }
    } catch (error) {
      console.error("Erro ao editar conta:", error);
    } finally {
      setSalvandoEdicao(false);
    }
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  const pegarIcone = (tipo) => {
    if (tipo === 'Dinheiro') return Wallet;
    if (tipo === 'Crédito') return CreditCard;
    return Building2;
  };

  return (
    <div className="space-y-6">
      
      {/* ALERTA DE EXCLUSÃO */}
      <AlertDialog open={contaParaExcluir !== null} onOpenChange={(aberto) => !aberto && setContaParaExcluir(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso vai excluir permanentemente a sua conta e remover o histórico.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={excluindo}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleExcluirConta} disabled={excluindo} className="bg-red-500 text-white hover:bg-red-600">
              {excluindo ? 'Excluindo...' : 'Sim, excluir conta'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* MODAL DE EDIÇÃO (NOVO) */}
      <Dialog open={modalEdicaoAberto} onOpenChange={setModalEdicaoAberto}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Editar conta</DialogTitle></DialogHeader>
          <form onSubmit={handleSalvarEdicao} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editNome">Nome da Conta</Label>
              <Input id="editNome" value={editNome} onChange={(e) => setEditNome(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editTipo">Tipo de Conta</Label>
              <select id="editTipo" value={editTipo} onChange={(e) => setEditTipo(e.target.value)} className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950">
                <option value="Corrente">Conta Corrente</option>
                <option value="Poupança">Conta Poupança</option>
                <option value="Dinheiro">Dinheiro Físico</option>
                <option value="Crédito">Cartão de Crédito</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editSaldo">Saldo Atual</Label>
              <Input id="editSaldo" type="number" step="0.01" value={editSaldo} onChange={(e) => setEditSaldo(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 mt-2" disabled={salvandoEdicao}>
              {salvandoEdicao ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Salvar Alterações'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Minhas Contas</h2>
          <p className="text-sm text-slate-500">Gerencie seus saldos e bancos.</p>
        </div>

        {/* MODAL DE CRIAÇÃO */}
        <Dialog open={modalAberto} onOpenChange={setModalAberto}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus size={16} className="mr-2" /> Nova Conta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Adicionar nova conta</DialogTitle></DialogHeader>
            <form onSubmit={handleCriarConta} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Conta</Label>
                <Input id="nome" value={nomeConta} onChange={(e) => setNomeConta(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Conta</Label>
                <select id="tipo" value={tipoConta} onChange={(e) => setTipoConta(e.target.value)} className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950">
                  <option value="Corrente">Conta Corrente</option>
                  <option value="Poupança">Conta Poupança</option>
                  <option value="Dinheiro">Dinheiro Físico</option>
                  <option value="Crédito">Cartão de Crédito</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="saldo">Saldo Atual</Label>
                <Input id="saldo" type="number" step="0.01" value={saldoConta} onChange={(e) => setSaldoConta(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 mt-2" disabled={salvando}>
                {salvando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Salvar Conta'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {carregando ? (
        <div className="text-center text-slate-500 py-10 font-medium flex justify-center items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" /> Carregando contas...
        </div>
      ) : contas.length === 0 ? (
        <div className="text-center text-slate-500 py-12 bg-white rounded-2xl border border-slate-200 border-dashed">
          Você ainda não tem nenhuma conta cadastrada.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {contas.map(conta => {
            const Icone = pegarIcone(conta.tipo);
            return (
              <Card key={conta.id} className="hover:border-blue-300 hover:shadow-md transition-all group border-slate-200">
                <CardContent className="p-6 h-44 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-slate-50 rounded-xl text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        <Icone size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{conta.nome}</h3>
                        <p className="text-xs text-slate-500">{conta.tipo}</p>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900">
                          <MoreHorizontal size={20} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        
                        {/* AÇÃO DE EDITAR CONECTADA */}
                        <DropdownMenuItem 
                          className="text-slate-700 cursor-pointer"
                          onClick={() => abrirModalEdicao(conta)}
                        >
                          <Edit3 size={16} className="mr-2" /> Editar
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                          className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                          onClick={() => setContaParaExcluir(conta.id)}
                        >
                          <Trash2 size={16} className="mr-2" /> Excluir
                        </DropdownMenuItem>
                        
                      </DropdownMenuContent>
                    </DropdownMenu>

                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Saldo atual</p>
                    <div className={`text-2xl font-bold tracking-tight ${conta.saldo_atual < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                      {formatarMoeda(conta.saldo_atual)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}