import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import React, { useState, useRef, useEffect } from "react";

function GaleriaMenu({
  onVer,
  onMoverParaFrente,
  onMoverParaTras,
  onEditarLegenda,
  onExcluir,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);

  useEffect(() => {
    const handleTouchOrClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target)
      ) {
        console.log(`Evento fora detectado: ${event.type}`);
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleTouchOrClickOutside);
    document.addEventListener("touchstart", handleTouchOrClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleTouchOrClickOutside);
      document.removeEventListener("touchstart", handleTouchOrClickOutside);
    };
  }, []);

  return (
    <Menu as="div" className="absolute top-2 right-2 z-50" ref={menuRef}>
      <MenuButton
        ref={menuButtonRef}
        className="p-1 rounded-full bg-white shadow hover:bg-gray-100"
        onClick={() => {
          console.log("MenuButton clicado");
          setIsOpen(true);
        }}
        onTouchStart={() => {
          console.log("MenuButton tocado");
          setIsOpen(true);
        }}
      >
        <EllipsisVerticalIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
      </MenuButton>

      {isOpen && (
        <MenuItems
          static
          className="absolute z-50 right-0 mt-2 w-40 sm:w-48 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black/5 focus:outline-none"
        >
          <div className="p-1 text-xs sm:text-sm text-gray-700">
            <MenuItem>
              {({ active }) => (
                <button
                  className={`w-full px-3 py-1 sm:px-4 sm:py-2 text-left ${
                    active ? "bg-gray-100" : ""
                  }`}
                  onClick={() => {
                    console.log("Ação: Ver foto");
                    onVer();
                    setIsOpen(false);
                  }}
                  onTouchStart={() => console.log("Toque: Ver foto")}
                >
                  Ver foto
                </button>
              )}
            </MenuItem>
            <MenuItem>
              {({ active }) => (
                <button
                  className={`w-full px-3 py-1 sm:px-4 sm:py-2 text-left ${
                    active ? "bg-gray-100" : ""
                  }`}
                  onClick={() => {
                    console.log("Ação: Mover para frente");
                    onMoverParaFrente();
                    setIsOpen(false);
                  }}
                  onTouchStart={() => console.log("Toque: Mover para frente")}
                >
                  Mover para frente
                </button>
              )}
            </MenuItem>
            <MenuItem>
              {({ active }) => (
                <button
                  className={`w-full px-3 py-1 sm:px-4 sm:py-2 text-left ${
                    active ? "bg-gray-100" : ""
                  }`}
                  onClick={() => {
                    console.log("Ação: Mover para trás");
                    onMoverParaTras();
                    setIsOpen(false);
                  }}
                  onTouchStart={() => console.log("Toque: Mover para trás")}
                >
                  Mover para trás
                </button>
              )}
            </MenuItem>
            <MenuItem>
              {({ active }) => (
                <button
                  className={`w-full px-3 py-1 sm:px-4 sm:py-2 text-left ${
                    active ? "bg-gray-100" : ""
                  }`}
                  onClick={() => {
                    console.log("Ação: Editar legenda");
                    onEditarLegenda();
                    setIsOpen(false);
                  }}
                  onTouchStart={() => console.log("Toque: Editar legenda")}
                >
                  Editar legenda
                </button>
              )}
            </MenuItem>
            <MenuItem>
              {({ active }) => (
                <button
                  className={`w-full px-3 py-1 sm:px-4 sm:py-2 text-left text-red-600 ${
                    active ? "bg-red-50" : ""
                  }`}
                  onClick={() => {
                    console.log("Ação: Excluir");
                    onExcluir();
                    setIsOpen(false);
                  }}
                  onTouchStart={() => console.log("Toque: Excluir")}
                >
                  Excluir
                </button>
              )}
            </MenuItem>
          </div>
        </MenuItems>
      )}
    </Menu>
  );
}

export default GaleriaMenu;