import React, { useState } from 'react';
import { Wallet, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Cadastro({ aoVoltarLogin }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const handleCadastro = async (e) => {
    e.preventDefault();
    setErro('');
    try {
      const response = await fetch('http://localhost:8000/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha })
      });
      if (response.ok) {
        setSucesso(true);
        setNome(''); setEmail(''); setSenha('');
      } else {
        const data = await response.json();
        setErro(data.detail || 'Erro ao criar conta.');
      }
    } catch (error) {
      setErro('Erro de conexão com o servidor.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-10">
        
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 text-white p-3 rounded-xl mb-4 shadow-sm">
            <Wallet size={28} strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900 mb-1">Criar conta</h2>
          <p className="text-sm text-gray-500">Preencha os dados abaixo para começar</p>
        </div>

        {sucesso ? (
          <div className="text-center space-y-4">
            <div className="bg-green-50 text-green-700 p-4 rounded-lg text-sm font-medium">
              Conta criada com sucesso!
            </div>
            <Button onClick={aoVoltarLogin} className="w-full bg-blue-600 hover:bg-blue-700 h-11">
              Ir para o Login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleCadastro} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Nome completo</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input placeholder="Seu nome" className="pl-9" value={nome} onChange={(e) => setNome(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input type="email" placeholder="seu@email.com" className="pl-9" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input type="password" placeholder="••••••••" className="pl-9" value={senha} onChange={(e) => setSenha(e.target.value)} required />
              </div>
            </div>

            {erro && <div className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-md font-medium">{erro}</div>}

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base">Criar conta</Button>
          </form>
        )}

        {!sucesso && (
          <div className="mt-8 text-center">
            <Button variant="link" onClick={aoVoltarLogin} className="text-sm text-slate-500 hover:text-blue-600 p-0">
              <ArrowLeft size={14} className="mr-2" /> Já tem uma conta? Fazer login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}