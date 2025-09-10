import React from 'react';

const Atendimento = () => {
  return (
    <div className="space-y-6">
      <div className="glass-intense rounded-2xl p-6 border-cosmic">
        <h1 className="text-3xl font-bold neon-text flex items-center">
          📞 Sistema de Atendimento
        </h1>
        <p className="text-gray-400 mt-2">
          Gestão de tickets e atendimento ao cliente
        </p>
      </div>
      
      <div className="glass-intense rounded-2xl p-8 border-cosmic text-center">
        <h2 className="text-xl neon-text-white mb-4">Em Desenvolvimento</h2>
        <p className="text-gray-400">
          Módulo de atendimento será implementado em breve
        </p>
      </div>
    </div>
  );
};

export default Atendimento;