import { Redirect } from "expo-router";
import { useAuth } from "@/context/AuthContext";

import {
  AnimatedSplashOverlay,
} from "@/components/animated-icon";

export default function Index() {
  const {
    usuario,
    loading,
    perfilCompleto,
  } = useAuth();

  if (loading) {
    return <AnimatedSplashOverlay />;
  }

  if (!usuario) {
    return <Redirect href="/login" />;
  }

  if (!perfilCompleto) {
    return (
      <Redirect href="/(tabs)/perfil" />
    );
  }

  return (
    <Redirect href="/(tabs)" />
  );
}