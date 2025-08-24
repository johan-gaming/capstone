// src/firebaseConfig.js
import {initializeApp} from 'firebase/app';
import {getAuth} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';
import { addDoc, collection, Timestamp } from 'firebase/firestore';



const firebaseConfig = {
  apiKey: 'AIzaSyCXMW7QXuCzLcqKB0i9CK7HG1WiMsrRSBo',
  authDomain: 'fooddonationconnector.firebaseapp.com',
  projectId: 'fooddonationconnector',
  storageBucket: 'fooddonationconnector.firebasestorage.app',
  messagingSenderId: '735842105729',
  appId: '1:735842105729:web:665293be86fbcca8285080'
};

// 🧠 Initialize Firebase App
const app = initializeApp(firebaseConfig);

// ✅ Export Auth and Firestore
const auth = getAuth(app);
const db = getFirestore(app);

export {auth, db};
