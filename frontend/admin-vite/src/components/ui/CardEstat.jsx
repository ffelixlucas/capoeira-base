function CardEstat({ valor, label, Icon, cor, onClick, cursor }) {
    const cores = {
      green: "bg-green-500/20 text-green-400",
      red: "bg-red-500/20 text-red-400",
      blue: "bg-blue-500/20 text-blue-400",
      amber: "bg-amber-500/20 text-amber-400",
      purple: "bg-purple-500/20 text-purple-400",
    };
  
    return (
      <div
        onClick={onClick}
        className={`p-4 rounded-xl bg-cor-card border border-cor-secundaria/30 flex items-center gap-4 ${
          cursor ? "cursor-pointer" : ""
        }`}
      >
        <div className={`p-2 rounded-lg ${cores[cor]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-lg font-bold text-cor-titulo">{valor}</p>
          <p className="text-sm text-cor-texto/80">{label}</p>
        </div>
      </div>
    );
  }
  
  export default CardEstat;
  