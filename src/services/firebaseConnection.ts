import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyAckNTe9BvSlnT8zXZJK5uU2pvPLxNOQ0g",
  authDomain: "taskboarddb.firebaseapp.com",
  projectId: "taskboarddb",
  storageBucket: "taskboarddb.firebasestorage.app",
  messagingSenderId: "667889492478",
  appId: "1:667889492478:web:de59e935bf60d2d2dfe0af"
};

const firebaseApp = initializeApp(firebaseConfig);

const db = getFirestore(firebaseApp)

export { db };