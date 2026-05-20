import React, { useState } from 'react';
import Login from './Login';
import Cadastro from './Cadastro';
import Dashboard from './Dashboard'; // <-- Importamos a tela nova!

function App() {
  const [telaAtual, setTelaAtual] = useState('login');
  const [usuarioLogado, setUsuarioLogado] = useState(null);

  const lidarComSucessoLogin = (usuarioId) => {
    setUsuarioLogado(usuarioId);
    setTelaAtual('dashboard'); // <-- Agora ele te joga pro Dashboard!
  };

  const lidarComSaida = () => {
    setUsuarioLogado(null);
    setTelaAtual('login'); // <-- Botão de sair te joga pro Login!
  };

  return (
    <div>
      {telaAtual === 'login' && (
        <Login 
          onLoginSuccess={lidarComSucessoLogin} 
          aoClicarCadastro={() => setTelaAtual('cadastro')} 
        />
      )}
      
      {telaAtual === 'cadastro' && (
        <Cadastro 
          aoVoltarLogin={() => setTelaAtual('login')} 
        />
      )}

      {telaAtual === 'dashboard' && (
        <Dashboard 
          usuarioId={usuarioLogado}
          aoSair={lidarComSaida}
        />
      )}
    </div>
  );
}

export default App;