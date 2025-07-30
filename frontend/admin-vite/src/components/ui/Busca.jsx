import { useState, useEffect } from "react";

function Busca({ placeholder, onBuscar, delay = 400 }) {
  const [texto, setTexto] = useState("");

  // Sempre que o texto mudar, esperar "delay" ms antes de chamar onBuscar
  useEffect(() => {
    const timer = setTimeout(() => {
      onBuscar(texto);
    }, delay);

    return () => clearTimeout(timer); // limpa o timer se digitar de novo
  }, [texto, delay, onBuscar]);

  return (
    <input
      type="text"
      placeholder={placeholder}
      value={texto}
      onChange={(e) => setTexto(e.target.value)}
      className="w-full border px-3 py-2 rounded-md text-sm text-black placeholder-gray-500"
    />
  );
}

export default Busca;
