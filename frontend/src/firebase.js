/*

import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCAX8XUX2_uonHQ87_78JrPpH-V3IlviV0",
  authDomain: "nightbyte-e4d5a.firebaseapp.com",
  projectId: "nightbyte-e4d5a",
  storageBucket: "nightbyte-e4d5a.firebasestorage.app",
  messagingSenderId: "45170526758",
  appId: "1:45170526758:web:ed1b60f9abffced67db4e7",
  measurementId: "G-09VVDXN4CK"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export { RecaptchaVerifier, signInWithPhoneNumber };*/


import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCAX8XUX2_uonHQ87_78JrPpH-V3IlviV0",
  authDomain: "nightbyte-e4d5a.firebaseapp.com",
  projectId: "nightbyte-e4d5a",
  storageBucket: "nightbyte-e4d5a.firebasestorage.app",
  messagingSenderId: "45170526758",
  appId: "1:45170526758:web:ed1b60f9abffced67db4e7",
  measurementId: "G-09VVDXN4CK",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();