import { useContext } from "react";
import { FamilyAuthContext } from "../contexts/FamilyAuthContext";

export function useFamilyAuth() {
  return useContext(FamilyAuthContext);
}
