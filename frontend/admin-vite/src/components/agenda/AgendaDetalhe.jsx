function AgendaDetalhe({ evento }) {
    if (!evento?.descricao_completa) return null;
  
    return (
      <div className="mt-2 px-2 py-3 border-l-4 border-green-600 bg-gray-50 text-sm text-gray-700 rounded">
        {evento.descricao_completa}
      </div>
    );
  }
  
  export default AgendaDetalhe;
  