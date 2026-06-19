import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { onAuthStateChanged } from "firebase/auth";

import { auth } from "@/config/firebase";
import { api } from "@/config/api";

interface UsuarioActual {
  id_usuario: number;
  email: string;
  nombre: string | null;
  apellido: string | null;
  tipo: "admin" | "estandar";
  roles: string[];
  persona_id: number;
  perfil_completo: boolean;
}

interface AuthContextType {
  usuario: UsuarioActual | null;
  loading: boolean;
  recargar: () => Promise<void>;
  esAdmin: boolean;
  perfilCompleto: boolean;
}

const AuthContext = createContext<AuthContextType>({
  usuario: null,
  loading: true,
  recargar: async () => {},
  esAdmin: false,
  perfilCompleto: false,
});

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [usuario, setUsuario] =
    useState<UsuarioActual | null>(null);

  const [loading, setLoading] =
    useState(true);

  const cargarUsuario = async () => {
    try {
      const firebaseUser =
        auth.currentUser;

      if (!firebaseUser) {
        setUsuario(null);
        return;
      }

      const token =
        await firebaseUser.getIdToken(true);

      const data =
        await api.getMe(token);

      setUsuario(data);

      console.log(
        "USUARIO RECARGADO:",
        data.email
      );

    } catch (error) {

      console.error(
        "ERROR RECARGANDO USUARIO:",
        error
      );

      setUsuario(null);
    }
  };

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (firebaseUser) => {

          try {

            setLoading(true);

            console.log(
              "========== AUTH CHANGED =========="
            );

            if (!firebaseUser) {

              console.log(
                "SIN SESION FIREBASE"
              );

              setUsuario(null);
              return;
            }

            console.log(
              "FIREBASE USER:",
              firebaseUser.email
            );

            const token =
              await firebaseUser.getIdToken(true);

            console.log(
              "TOKEN OBTENIDO"
            );

            const data =
              await api.getMe(token);

            console.log(
              "DATOS BACK:",
              JSON.stringify(
                data,
                null,
                2
              )
            );

            setUsuario(data);

            console.log(
              "USUARIO GUARDADO"
            );

          } catch (error) {

            console.error(
              "ERROR AUTH CONTEXT:",
              error
            );

            setUsuario(null);

          } finally {

            setLoading(false);

            console.log(
              "LOADING FALSE"
            );
          }
        }
      );

    return unsubscribe;
  }, []);

  const esAdmin =
    usuario?.tipo === "admin";

  const perfilCompleto =
  usuario?.perfil_completo ?? false;

  return (
    <AuthContext.Provider
      value={{
        usuario,
        loading,
        recargar: cargarUsuario,
        esAdmin,
        perfilCompleto,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}