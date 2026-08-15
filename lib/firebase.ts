import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyB54WgwAZs-5JgmUS2QWMEMxH-X1gKnIeU",
  authDomain: "smart-traffic-control-69f40.firebaseapp.com",
  databaseURL:
    "https://smart-traffic-control-69f40-default-rtdb.firebaseio.com",
  projectId: "smart-traffic-control-69f40",
  storageBucket: "smart-traffic-control-69f40.firebasestorage.app",
  messagingSenderId: "60467961249",
  appId: "1:60467961249:web:0e02df4a20475c28b3bfe0",
  measurementId: "G-HF717D5QS0",
};

const app =
  getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApp();

export const database = getDatabase(app);

export default app;