import { initializeApp } from "firebase/app";

import {
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBSXZm9mp0v3Rmk8iuQvCgySxtd1e-_qGk",
  authDomain: "refugio-cmbs.firebaseapp.com",
  projectId: "refugio-cmbs",
  storageBucket: "refugio-cmbs.firebasestorage.app",
  messagingSenderId: "13049423961",
  appId: "1:13049423961:web:315aba03ebc283f7f66948",
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(
    AsyncStorage
  ),
});

export const storage = getStorage(app);