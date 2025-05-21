import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";

function GaleriaMenu({ onVer, onMover, onGirar, onExcluir }) {
  return (
    <Menu as="div" className="absolute top-1 right-1 z-50">
      <MenuButton className="p-1 rounded-full bg-white shadow hover:bg-gray-100">
        <EllipsisVerticalIcon className="h-4 w-4 text-gray-600" />
      </MenuButton>

      <MenuItems className="absolute z-50 right-0 mt-2 w-44 origin-top-right rounded bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
        <div className="p-1 text-sm text-gray-700">
          <MenuItem>
            <button
              className="w-full px-3 py-2 text-left ui-active:bg-gray-100"
              onClick={onVer}
            >
              Ver foto
            </button>
          </MenuItem>
          <MenuItem>
            <button
              className="w-full px-3 py-2 text-left ui-active:bg-gray-100"
              onClick={onMover}
            >
              Mover para trás
            </button>
          </MenuItem>
          <MenuItem>
            <button
              className="w-full px-3 py-2 text-left ui-active:bg-gray-100"
              onClick={onGirar}
            >
              Girar
            </button>
          </MenuItem>
          <MenuItem>
            <button
              className="w-full px-3 py-2 text-left text-red-600 ui-active:bg-red-50"
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
