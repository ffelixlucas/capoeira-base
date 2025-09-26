function CardEstat({ valor, label, Icon, cor, onClick, cursor }) {
  const cores = {
    green: "bg-green-500/20 text-green-500",
    red: "bg-red-500/20 text-red-500",
    blue: "bg-blue-500/20 text-blue-500",
    amber: "bg-amber-500/20 text-amber-500",
    purple: "bg-purple-500/20 text-purple-500",
  };

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 rounded-lg bg-cor-card border border-cor-secundaria/30 px-3 py-2 ${
        cursor ? "cursor-pointer" : ""
      }`}
    >
      <div className={`w-8 h-8 flex items-center justify-center rounded-md ${cores[cor]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-base font-semibold text-cor-titulo">{valor}</p>
        <p className="text-xs text-cor-texto/80">{label}</p>
      </div>
    </div>
  );
}

export default CardEstat;
