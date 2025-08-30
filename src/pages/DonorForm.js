import React, {useState} from 'react';
import {collection, addDoc, doc, getDoc, updateDoc, increment, Timestamp} from 'firebase/firestore';
import {auth, db} from '../firebaseConfig';

const DonorForm = ({onClose, onSuccess}) => {
  const [formData, setFormData] = useState({
    item: '',
    quantity: '',
    notes: '',
    address: '',
    pickupTime: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.item || !formData.quantity || !formData.address || !formData.pickupTime) {
      alert('Please fill in all required fields.');
      return;
    }

    if (!auth.currentUser) {
      alert('⚠️ You must be logged in to post a donation.');
      return;
    }

    setLoading(true);
    try {
      // 🔑 Fetch donor name
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userDoc = await getDoc(userRef);
      const donorName = userDoc.exists()
        ? (userDoc.data().name || auth.currentUser.email)
        : auth.currentUser.email;

      // 🔑 Create new donation
      const newDonation = {
        item: formData.item,
        quantity: parseInt(formData.quantity),
        notes: formData.notes,
        address: formData.address,
        pickupTime: formData.pickupTime,
        status: 'Pending',
        donorId: auth.currentUser.uid,
        donorName,
        createdAt: Timestamp.now()
      };

      await addDoc(collection(db, 'donations'), newDonation);

      // 🔑 Increment total donations count
      await updateDoc(userRef, {
        totalDonations: increment(1)
      });

      onSuccess();
    } catch (error) {
      console.error('Error posting donation:', error);
      alert('Failed to post donation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="modal-form fade-in" onSubmit={handleSubmit}>
      <h3>Post New Donation</h3>

      <input
        type="text"
        name="item"
        placeholder="Food Item"
        value={formData.item}
        onChange={handleChange}
        required
      />

      <input
        type="number"
        name="quantity"
        placeholder="Quantity"
        value={formData.quantity}
        onChange={handleChange}
        required
      />

      <input
        type="text"
        name="address"
        placeholder="Pickup Address"
        value={formData.address}
        onChange={handleChange}
        required
      />

      <input
        type="datetime-local"
        name="pickupTime"
        value={formData.pickupTime}
        onChange={handleChange}
        required
      />

      <textarea
        name="notes"
        placeholder="Additional Notes (optional)"
        value={formData.notes}
        onChange={handleChange}
        rows={3}
      />

      <div className="modal-buttons">
        <button type="submit" disabled={loading} className="btn-submit">
          {loading ? 'Posting...' : 'Submit'}
        </button>
        <button type="button" onClick={onClose} className="btn-cancel">
          Cancel
        </button>
      </div>
    </form>
  );
};

export default DonorForm;
