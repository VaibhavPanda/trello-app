import { GoogleAuthProvider, signInWithPopup , signOut} from "firebase/auth";

import { auth } from "../firebase/firebase";

const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = () => {
  return signInWithPopup(auth, googleProvider);
};

export const logout = () =>{
  return signOut(auth);
}
