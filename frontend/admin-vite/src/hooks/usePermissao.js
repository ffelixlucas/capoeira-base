import { useAuth } from "../contexts/AuthContext";

export const usePermissao = () => {
  const { usuario } = useAuth();

  const temPapel = (papelOuPapeis) => {
    if (!usuario || !usuario.roles) return false;

    if (Array.isArray(papelOuPapeis)) {
      return papelOuPapeis.some((p) => usuario.roles.includes(p));
    }

    return usuario.roles.includes(papelOuPapeis);
  };

  return { temPapel };
};
