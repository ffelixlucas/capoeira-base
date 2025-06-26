// src/pages/Equipe.jsx
import React from "react";
import EquipeList from "../components/equipe/EquipeList";



function Equipe() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Gestão da Equipe</h1>
      <EquipeList />
    </div>
  );
}

export default Equipe;
