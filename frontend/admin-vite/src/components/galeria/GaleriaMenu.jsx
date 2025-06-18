import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";

function GaleriaMenu({
  onVer,
  onMoverParaFrente,
  onMoverParaTras,
  onEditarLegenda,
  onExcluir,
}) {
  return (
    <Menu as="div" className="absolute top-2 right-2 z-50">
      <MenuButton className="p-1 rounded-full bg-white shadow hover:bg-gray-100">
        <EllipsisVerticalIcon className="h-5 w-5 text-gray-600" />
      </MenuButton>

      <MenuItems className="absolute z-50 right-0 mt-2 w-48 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
        <div className="p-1 text-sm text-gray-700">
          <MenuItem>
            <button
              className="w-full px-4 py-2 text-left hover:bg-gray-100"
              onClick={onVer}
            >
              Ver foto
            </button>
          </MenuItem>
          <MenuItem>
            <button
              className="w-full px-4 py-2 text-left hover:bg-gray-100"
              onClick={onMoverParaFrente}
            >
              Mover para frente
            </button>
          </MenuItem>
          <MenuItem>
            <button
              className="w-full px-4 py-2 text-left hover:bg-gray-100"
              onClick={onMoverParaTras}
            >
              Mover para trás
            </button>
          </MenuItem>
          <MenuItem>
            <button
              className="w-full px-4 py-2 text-left hover:bg-gray-100"
              onClick={onEditarLegenda}
            >
              Editar legenda
            </button>
          </MenuItem>
          <MenuItem>
            <button
              className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50"
              onClick={onExcluir}
            >
              Excluir
            </button>
          </MenuItem>
        </div>
      </MenuItems>
    </Menu>
  );
}

export default GaleriaMenu;
