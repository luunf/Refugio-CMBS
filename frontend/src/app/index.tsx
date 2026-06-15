import { Redirect } from "expo-router";

import { useAuth } from "@/context/AuthContext";

import {
  AnimatedSplashOverlay,
} from "@/components/animated-icon";

export default function Index() {
  const {
    usuario,
    loading,
  } = useAuth();


  if (loading) {
    return (
      <AnimatedSplashOverlay />
    );
  }

  if (!usuario) {
    return (
      <Redirect href="/login" />
    );
  }

  return (
    <Redirect href="/(tabs)" />
  );
}