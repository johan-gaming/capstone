import {useEffect, useState} from 'react';
import {auth, db} from '../firebaseConfig';
import {collection, query, where, onSnapshot} from 'firebase/firestore';

const MyDonations = () => {
  const [donations, setDonations] = useState([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'donations'),
      where('donorId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setDonations(items);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div style={{padding: '40px'}}>
      <h2>📋 My Donations</h2>
      {donations.length === 0 ? (
        <p>You haven't posted any donations yet.</p>
      ) : (
        <ul>
          {donations.map((donation) => (
            <li key={donation.id} style={{marginBottom: '20px'}}>
              <strong>{donation.foodName}</strong> – {donation.quantity} servings<br/>
              Address: {donation.address}<br/>
              Expires: {donation.expiration}<br/>
              {
                donation.claimedBy
                  ? <span>✅ Claimed by: <strong>{donation.claimedBy}</strong></span>
                  : <span>🕒 Not yet claimed</span>
              }
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyDonations;
