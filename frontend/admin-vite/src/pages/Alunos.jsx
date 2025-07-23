import BotaoVoltarDashboard from "../components/ui/BotaoVoltarDashboard";
import AlunoList from "../components/alunos/AlunoList";

function Alunos() {
  return (
    <div className="p-6 text-center">
      <BotaoVoltarDashboard />
      <AlunoList />
    </div>
  );
}

export default Alunos;
