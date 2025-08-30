import React,{useState,useEffect} from 'react';
import './DonorDashboard.css';
import {db} from '../firebaseConfig';
import {collection,addDoc,getDocs,query,where,Timestamp} from 'firebase/firestore';

const DonorDashboard = () => {
  const [donations,setDonations] = useState([]);
  const [loading,setLoading] = useState(true);
  const [showModal,setShowModal] = useState(false);

  // Fetch donations (all donations for this donor, based on name if saved)
  const fetchDonations = async() => {
    try {
      const q = query(collection(db,'donations'));
      const querySnapshot = await getDocs(q);
      const donorData = querySnapshot.docs.map(doc=>({
        id: doc.id,
        ...doc.data()
      }));
      setDonations(donorData);
    } catch(err){
      console.error('Error fetching donations:',err);
      alert('Failed to load donations.');
    } finally {
      setLoading(false);
    }
  };

  // Post a new donation
  const addDonation = async(donor,item,quantity) => {
    try {
      await addDoc(collection(db,'donations'),{
        donorName: donor || null,
        item,
        quantity,
        status:'Available',
        createdAt: Timestamp.now()
      });
      fetchDonations();
    } catch(err){
      console.error('Error adding donation:',err);
    }
  };

  useEffect(()=>{
    fetchDonations();
  },[]);

  return (
    <div className="dashboard-container fade-in">
      <h1 className="dashboard-header">Donor Dashboard</h1>

      <div className="summary-card">
        <p>
          Total Donations Made: <strong>{donations.length}</strong>
        </p>
      </div>

      <button className="donation-button" onClick={()=>setShowModal(true)}>
        Post New Donation
      </button>

      <div className="donation-history">
        <h2>Recent Donations</h2>
        <table className="donation-table">
          <thead>
            <tr>
              <th>Donor</th>
              <th>Food Item</th>
              <th>Quantity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4">Loading...</td>
              </tr>
            ) : donations.length>0 ? (
              donations.map((donation)=>(
                <tr key={donation.id}>
                  <td>{donation.donorName || 'Anonymous'}</td>
                  <td>{donation.item}</td>
                  <td>{donation.quantity}</td>
                  <td>{donation.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No donations yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-box fade-in">
            <DonationForm
              onClose={()=>setShowModal(false)}
              onSubmit={(donor,item,quantity)=>{
                addDonation(donor,item,quantity);
                setShowModal(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Inline form
const DonationForm = ({onClose,onSubmit}) => {
  const [donor,setDonor] = useState('');
  const [item,setItem] = useState('');
  const [quantity,setQuantity] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if(item && quantity){
      onSubmit(donor,item,quantity);
    }
  };

  return (
    <form className="donor-form" onSubmit={handleSubmit}>
      <h2>Post New Donation</h2>
      <label>Your Name (optional)</label>
      <input value={donor} onChange={(e)=>setDonor(e.target.value)} placeholder="Leave blank for anonymous" />
      <label>Food Item</label>
      <input value={item} onChange={(e)=>setItem(e.target.value)} required />
      <label>Quantity</label>
      <input value={quantity} onChange={(e)=>setQuantity(e.target.value)} required />
      <div className="form-actions">
        <button type="submit">Submit</button>
        <button type="button" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
};

export default DonorDashboard;
