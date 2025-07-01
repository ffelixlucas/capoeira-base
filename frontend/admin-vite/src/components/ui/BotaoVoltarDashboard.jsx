// src/components/ui/BotaoVoltarDashboard.jsx
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function BotaoVoltarDashboard({ className = "" }) {
  const navigate = useNavigate();

  return (
<button
  onClick={() => navigate("/dashboard")}
  className="text-xs text-cor-texto hover:text-cor-primaria flex items-center space-x-1 self-start"
>
  <ArrowLeftIcon className="h-4 w-4" />
  <span>Início</span>
</button>


  
  );
}
