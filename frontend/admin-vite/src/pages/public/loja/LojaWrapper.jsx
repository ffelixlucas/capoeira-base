import { Outlet } from "react-router-dom";
import { CarrinhoProvider } from "../../../contexts/public/loja/CarrinhoContext";

export default function LojaWrapper() {
  return (
    <CarrinhoProvider>
      <Outlet />
    </CarrinhoProvider>
  );
}
