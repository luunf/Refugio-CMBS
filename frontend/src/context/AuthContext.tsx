import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/config/api";

interface UsuarioActual {
  id_usuario: number;
  email: string;
  nombre: string | null;
  apellido: string | null;
  tipo: "admin" | "estandar";
  roles: string[];
  persona_id: number;
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioActual | null>(null);
  const [loading, setLoading] = useState(true);

  const cargar = async () => {
    setLoading(true);

    try {
      // descomentar según quieran loguearse como admin o usuario estándar (o implementar firebase), para ver las vistas correspondientes
      // ADMIN
      const data = await api.devLogin(1);

      // USUARIO ESTANDAR
      // const data = await api.devLogin(2);

      setUsuario(data);

      // CUANDO IMPLEMENTEMOS FIREBASE:
      // const data = await api.getMe();
      // setUsuario(data);

    } catch (e) {
      console.error(e);
      setUsuario(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const esAdmin = usuario?.tipo === "admin";
  const perfilCompleto = !!(usuario?.nombre && usuario?.apellido);

  return (
    <AuthContext.Provider
      value={{
        usuario,
        loading,
        recargar: cargar,
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