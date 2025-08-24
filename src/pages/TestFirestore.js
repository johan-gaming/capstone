import {useEffect} from 'react';
import {db} from '../firebaseConfig';
import {doc, getDoc} from 'firebase/firestore';

const TestFirestore = () => {
  useEffect(() => {
    const run = async () => {
      try {
        const docRef = doc(db, 'test', 'test');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          console.log('✅ Firestore is working:', docSnap.data());
        } else {
          console.log('❌ No such document!');
        }
      } catch (error) {
        console.error('❗ Error connecting to Firestore:', error.message);
      }
    };

    run();
  }, []);

  return <h1>🔍 Testing Firestore Connection...</h1>;
};

export default TestFirestore;
