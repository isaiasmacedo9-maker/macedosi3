import React from 'react';

const ClientsList = () => {
  return (
    <div className="space-y-6">
      <div className="glass-intense rounded-2xl p-6 border-cosmic">
        <h1 className="text-3xl font-bold neon-text flex items-center">
          🏢 Gestão de Clientes
        </h1>
        <p className="text-gray-400 mt-2">
          Sistema de cadastro e gerenciamento de clientes
        </p>
      </div>
      
      <div className="glass-intense rounded-2xl p-8 border-cosmic text-center">
        <h2 className="text-xl neon-text-white mb-4">Em Desenvolvimento</h2>
        <p className="text-gray-400">
          Módulo de clientes será implementado em breve
        </p>
      </div>
    </div>
  );
};

export default ClientsList;