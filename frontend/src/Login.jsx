import React, { useState } from 'react';
import { Wallet, Mail, Lock } from 'lucide-react';
import { Button } from "@/components/ui/button"; // <-- Importando o botão do shadcn
import { Input } from "@/components/ui/input";   // <-- Importando o input do shadcn

export default function Login({ onLoginSuccess, aoClicarCadastro }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    
    try {
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
      });
      
      if (response.ok) {
        const data = await response.json();
        onLoginSuccess(data.usuario_id);
      } else {
        setErro('Credenciais inválidas. Verifique seu email e senha.');
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
          <h2 className="text-2xl font-semibold tracking-tight text-gray-900 mb-1">
            Bem-vindo de volta
          </h2>
          <p className="text-sm text-gray-500">
            Entre com suas credenciais para acessar sua conta
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input 
                type="email" 
                placeholder="seu@email.com" 
                className="pl-9" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input 
                type="password" 
                placeholder="••••••••" 
                className="pl-9"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </div>
          </div>

          {erro && (
            <div className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-md font-medium">
              {erro}
            </div>
          )}

          {/* Olha como o botão fica limpo e simples! */}
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base">
            Entrar
          </Button>

        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          Não tem uma conta?{' '}
          <Button variant="link" onClick={aoClicarCadastro} className="p-0 text-blue-600">
            Criar conta
          </Button>
        </div>
      </div>
    </div>
  );
}