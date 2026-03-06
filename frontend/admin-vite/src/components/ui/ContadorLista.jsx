function ContadorLista({ total, label = "encontrados", className = "" }) {
    return (
      <p className={`text-sm ${className}`}>
        {total} {label}
      </p>
    );
  }
  
  export default ContadorLista;
  
