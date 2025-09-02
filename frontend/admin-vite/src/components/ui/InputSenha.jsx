import { useState } from "react";
import InputBase from "./InputBase";
import { Eye, EyeOff } from "lucide-react"; // já vem no shadcn/lucide

export default function InputSenha({ placeholder, value, onChange }) {
  const [mostrar, setMostrar] = useState(false);

  return (
    <div className="relative">
      <InputBase
        type={mostrar ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      <button
        type="button"
        onClick={() => setMostrar(!mostrar)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
      >
        {mostrar ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
