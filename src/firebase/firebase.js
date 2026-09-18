// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDcrc9CqUk5DuDos6FgmTgY6u4cJaVgp8Q",
  authDomain: "trello-app-19114.firebaseapp.com",
  projectId: "trello-app-19114",
  storageBucket: "trello-app-19114.firebasestorage.app",
  messagingSenderId: "53551596689",
  appId: "1:53551596689:web:86f466aa441c5430abeb30",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app)
export const db = getFirestore(app)

export default app;
