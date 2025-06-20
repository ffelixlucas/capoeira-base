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
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  return (
    <Menu as="div" className="absolute top-2 right-2 z-50" ref={menuRef}>
      <MenuButton
        ref={menuButtonRef}
        className="p-1 rounded-full bg-white shadow hover:bg-gray-100"
        onClick={() => setIsOpen(true)}
        aria-label="Abrir menu de opções da imagem"
      >
        <EllipsisVerticalIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
      </MenuButton>

      {isOpen && (
        <MenuItems
          static
          className="absolute z-50 right-0 mt-2 w-40 sm:w-48 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black/5 focus:outline-none"
          role="menu"
        >
          <div className="p-1 text-xs sm:text-sm text-gray-700">
            <MenuItem>
              {({ active }) => (
                <button
                  className={`w-full px-3 py-1 sm:px-4 sm:py-2 text-left rounded ${
                    active ? "bg-gray-100" : ""
                  }`}
                  onClick={() => {
                    onVer();
                    setIsOpen(false);
                  }}
                  aria-label="Ver foto em nova aba"
                  role="menuitem"
                >
                  Ver foto
                </button>
              )}
            </MenuItem>

            <MenuItem>
              {({ active }) => (
                <button
                  className={`w-full px-3 py-1 sm:px-4 sm:py-2 text-left rounded ${
                    active ? "bg-gray-100" : ""
                  }`}
                  onClick={() => {
                    onMoverParaFrente();
                    setIsOpen(false);
                  }}
                  aria-label="Mover imagem para frente"
                  role="menuitem"
                >
                  Mover para frente
                </button>
              )}
            </MenuItem>

            <MenuItem>
              {({ active }) => (
                <button
                  className={`w-full px-3 py-1 sm:px-4 sm:py-2 text-left rounded ${
                    active ? "bg-gray-100" : ""
                  }`}
                  onClick={() => {
                    onMoverParaTras();
                    setIsOpen(false);
                  }}
                  aria-label="Mover imagem para trás"
                  role="menuitem"
                >
                  Mover para trás
                </button>
              )}
            </MenuItem>

            <MenuItem>
              {({ active }) => (
                <button
                  className={`w-full px-3 py-1 sm:px-4 sm:py-2 text-left rounded ${
                    active ? "bg-gray-100" : ""
                  }`}
                  onClick={() => {
                    onEditarLegenda();
                    setIsOpen(false);
                  }}
                  aria-label="Editar legenda da imagem"
                  role="menuitem"
                >
                  Editar legenda
                </button>
              )}
            </MenuItem>

            <MenuItem>
              {({ active }) => (
                <button
                  className={`w-full px-3 py-1 sm:px-4 sm:py-2 text-left text-red-600 rounded ${
                    active ? "bg-red-50" : ""
                  }`}
                  onClick={() => {
                    onExcluir();
                    setIsOpen(false);
                  }}
                  aria-label="Excluir imagem da galeria"
                  role="menuitem"
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
