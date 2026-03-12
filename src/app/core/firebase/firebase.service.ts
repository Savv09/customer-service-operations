import { Injectable } from '@angular/core';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

import { app } from './firebase.config';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  auth = getAuth(app);
  firestore = getFirestore(app);
}
