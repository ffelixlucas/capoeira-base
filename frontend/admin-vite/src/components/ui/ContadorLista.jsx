function ContadorLista({ total, label = "encontrados" }) {
    return (
      <p className="text-sm text-white">
        {total} {label}
      </p>
    );
  }
  
  export default ContadorLista;
  