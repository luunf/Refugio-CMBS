import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBSXZm9mp0v3Rmk8iuQvCgySxtd1e-_qGk",
  authDomain: "refugio-cmbs.firebaseapp.com",
  projectId: "refugio-cmbs",
  storageBucket: "refugio-cmbs.firebasestorage.app",
  messagingSenderId: "13049423961",
  appId: "1:13049423961:web:315aba03ebc283f7f66948"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const storage = getStorage(app);