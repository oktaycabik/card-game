// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyBadvbj9noHZpRbjxBvEEn_a-uO8djxFcc",
    authDomain: "card-game-fa82c.firebaseapp.com",
    projectId: "card-game-fa82c",
    storageBucket: "card-game-fa82c.appspot.com",
    messagingSenderId: "592417975662",
    appId: "1:592417975662:web:509d7ee0552257e2db257f",
    measurementId: "G-FTB49QCD99"
  };

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };
