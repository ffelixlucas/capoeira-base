import React from 'react';
import LembreteCard from './LembreteCard';
import { usePermissao } from '../../hooks/usePermissao';

export default function LembreteLista({ lembretes, onEditar, onExcluir }) {
  const { temPapel } = usePermissao();

  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
      {lembretes.length === 0 && (
        <p className="text-sm text-gray-500 text-center">Nenhum lembrete encontrado.</p>
      )}

      {lembretes.map((item) => (
        <LembreteCard
          key={item.id}
          lembrete={item}
          podeEditar={temPapel(['admin', 'instrutor'])}
          podeExcluir={temPapel(['admin'])}
          onEditar={(id, dados) => onEditar(id, dados)} // 👈 Aqui
          onExcluir={() => onExcluir(item.id)}
        />
      ))}
    </div>
  );
}
