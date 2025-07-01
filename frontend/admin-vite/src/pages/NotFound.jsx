import BotaoVoltarDashboard from "../components/ui/BotaoVoltarDashboard";

function NotFound() {
    return (
      <div className="p-6 text-center">
        <BotaoVoltarDashboard className="mb-4" />
        <h1 className="text-2xl text-red-600 font-bold">404 – Página não encontrada</h1>
      </div>
    );
  }
  
  export default NotFound;
  