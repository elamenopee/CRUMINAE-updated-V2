
import {
  getApp,
  getApps,
  initializeApp
} from 'firebase/app';

import {
  getFirestore
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCRKuqiepkvPMuo3Gl5i4KSE2id369hARI',
  authDomain: 'cruminae.firebaseapp.com',
  projectId: 'cruminae',
  storageBucket: 'cruminae.firebasestorage.app',
  messagingSenderId: '908397998428',
  appId: '1:908397998428:web:51c2b78734494934215199',
  measurementId: 'G-CNP5QZB8BK'
};

export const firebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

export const db = getFirestore(firebaseApp);
