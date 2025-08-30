// src/components/NGODashboard.js
import React,{useState,useEffect} from 'react';
import './NGODashboard.css';
import {db} from '../firebaseConfig';
import {collection,getDocs,updateDoc,doc} from 'firebase/firestore';

const NGODashboard = () => {
  const [donations,setDonations] = useState([]);
  const [loading,setLoading] = useState(true);

  // Fetch donations
  const fetchDonations = async() => {
    try {
      const querySnapshot = await getDocs(collection(db,'donations'));
      const donationData = querySnapshot.docs.map(doc=>({
        id: doc.id,
        ...doc.data()
      }));
      setDonations(donationData);
    } catch(err){
      console.error('Error fetching donations:',err);
      alert('Failed to load donations.');
    } finally {
      setLoading(false);
    }
  };

  // Claim donation
  const claimDonation = async(id) => {
    try {
      const donationRef = doc(db,'donations',id);
      await updateDoc(donationRef,{status:'Claimed'});
      fetchDonations();
    } catch(err){
      console.error('Error claiming donation:',err);
    }
  };

  // Rate donor
  const rateDonor = async(id,rating) => {
    try {
      const donationRef = doc(db,'donations',id);
      await updateDoc(donationRef,{rating});
      fetchDonations();
    } catch(err){
      console.error('Error rating donor:',err);
    }
  };

  useEffect(()=>{
    fetchDonations();
  },[]);

  return (
    <div className="dashboard-container fade-in">
      <h1 className="dashboard-header">NGO Dashboard</h1>

      <div className="donation-history">
        <h2>Available Donations</h2>
        <table className="donation-table">
          <thead>
            <tr>
              <th>Donor</th>
              <th>Item</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Action</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6">Loading...</td>
              </tr>
            ) : donations.length>0 ? (
              donations.map((donation)=>(
                <tr key={donation.id}>
                  <td>{donation.donorName}</td>
                  <td>{donation.item}</td>
                  <td>{donation.quantity}</td>
                  <td>{donation.status}</td>
                  <td>
                    {donation.status==='Available' ? (
                      <button onClick={()=>claimDonation(donation.id)}>
                        Claim
                      </button>
                    ) : (
                      'Claimed'
                    )}
                  </td>
                  <td>
                    <select
                      value={donation.rating || ''}
                      onChange={(e)=>rateDonor(donation.id,e.target.value)}
                    >
                      <option value="">Rate</option>
                      <option value="1">⭐</option>
                      <option value="2">⭐⭐</option>
                      <option value="3">⭐⭐⭐</option>
                      <option value="4">⭐⭐⭐⭐</option>
                      <option value="5">⭐⭐⭐⭐⭐</option>
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No donations available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NGODashboard;
