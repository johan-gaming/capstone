import React,{useState,useEffect} from 'react';
import './DonorDashboard.css';
import {collection,query,where,getDocs,doc,getDoc} from 'firebase/firestore';
import {auth,db} from '../firebaseConfig';
import DonorForm from './DonorForm';


const DonorDashboard = () => {
  const [donations,setDonations] = useState([]);
  const [loading,setLoading] = useState(true);
  const [showModal,setShowModal] = useState(false);
  const [donorName,setDonorName] = useState('');

  const fetchDonations = async() => {
    try {
      const q = query(
        collection(db,'donations'),
        where('donorId','==',auth.currentUser.uid)
      );
      const snapshot = await getDocs(q);
      const results = snapshot.docs.map((doc,index)=>({
        id:index+1,
        ...doc.data()
      }));
      setDonations(results);
    } catch(err){
      console.error('Error fetching donations:',err);
      alert('Failed to load donations.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserName = async() => {
    try {
      const userDoc = await getDoc(doc(db,'users',auth.currentUser.uid));
      if(userDoc.exists()){
        setDonorName(userDoc.data().name || 'Donor');
      }
    } catch(err){
      console.error('Error fetching user name:',err);
    }
  };

  useEffect(()=>{
    if(auth.currentUser){
      fetchUserName();
      fetchDonations();
    }
  },[]);

  return (
    <div className="dashboard-container fade-in">
      <h1 className="dashboard-header">Welcome, {donorName}</h1>

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
              <th>ID</th>
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
                  <td>{donation.id}</td>
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
            <DonorForm
              onClose={()=>setShowModal(false)}
              onSuccess={()=>{
                fetchDonations();
                setShowModal(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DonorDashboard;
