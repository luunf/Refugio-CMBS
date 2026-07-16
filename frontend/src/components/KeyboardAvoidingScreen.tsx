import React from "react";
import {
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StyleSheet,
  ViewStyle,
  ScrollViewProps,
} from "react-native";

type Props = {
  children: React.ReactNode;
  contentContainerStyle?: ViewStyle;
  keyboardVerticalOffset?: number;
} & Pick<ScrollViewProps, "keyboardShouldPersistTaps">;

export default function KeyboardAvoidingScreen({
  children,
  contentContainerStyle,
  keyboardVerticalOffset = 0,
  keyboardShouldPersistTaps = "handled",
}: Props) {
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      <ScrollView
        contentContainerStyle={[styles.defaultContent, contentContainerStyle]}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  defaultContent: { flexGrow: 1 },
});