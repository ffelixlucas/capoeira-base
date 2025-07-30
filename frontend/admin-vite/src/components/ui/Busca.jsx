import { useState } from "react";

function Busca({ placeholder, onBuscar }) {
  const [texto, setTexto] = useState("");

  function handleChange(e) {
    const valor = e.target.value;
    setTexto(valor);
    onBuscar(valor); // devolve o valor para o componente pai
  }

  return (
    <input
      type="text"
      placeholder={placeholder}
      value={texto}
      onChange={handleChange}
      className="w-full border px-3 py-2 rounded-md text-sm text-black placeholder-gray-500 mb-3"
    />
  );
}

export default Busca;
