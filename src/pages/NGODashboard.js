import React,{useEffect,useState} from 'react';
import './NGODashboard.css';
import {collection,onSnapshot,query,orderBy,doc,updateDoc,getDoc} from 'firebase/firestore';
import {auth,db} from '../firebaseConfig';

const NGODashboard = () => {
  const [donations,setDonations] = useState([]);
  const [ngoName,setNgoName] = useState('');

  useEffect(()=>{
    const fetchUserName = async()=>{
      try{
        const userDoc = await getDoc(doc(db,'users',auth.currentUser.uid));
        if(userDoc.exists()){
          setNgoName(userDoc.data().name || 'NGO');
        }
      } catch(err){
        console.error('Error fetching NGO name:',err);
      }
    };
    if(auth.currentUser) fetchUserName();
  },[]);

  useEffect(()=>{
    const q = query(collection(db,'donations'),orderBy('createdAt','desc'));
    const unsubscribe = onSnapshot(q,(snap)=>{
      const data = snap.docs.map((doc)=>({
        id:doc.id,
        item:doc.data().item || 'Unnamed Item',
        quantity:doc.data().quantity || 0,
        status:doc.data().status || 'Pending',
        notes:doc.data().notes || '—',
      }));
      setDonations(data);
    });
    return ()=>unsubscribe();
  },[]);

  const handleClaim = async(id)=>{
    try{
      const donationRef = doc(db,'donations',id);
      await updateDoc(donationRef,{ status:'Claimed' });
      alert('Donation claimed!');
    } catch(error){
      console.error('Error claiming donation:',error);
      alert('Failed to claim donation');
    }
  };

  return (
    <div className="ngo-container fade-in">
      <h1 className="ngo-header">Welcome, {ngoName}</h1>
      <div className="ngo-donations">
        <h2>Available Donations</h2>
        <table className="ngo-table">
          <thead>
            <tr>
              <th>Food Item</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Notes</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {donations.map((donation,index)=>(
              <tr key={donation.id} className="fade-in">
                <td>{donation.item}</td>
                <td>{donation.quantity}</td>
                <td>{donation.status}</td>
                <td>{donation.notes}</td>
                <td>
                  {donation.status!=='Claimed' ? (
                    <button onClick={()=>handleClaim(donation.id)} style={{
                      padding:'6px 12px',
                      backgroundColor:'#000',
                      color:'#fff',
                      border:'none',
                      borderRadius:'4px',
                      cursor:'pointer'
                    }}>Claim</button>
                  ) : (
                    <span style={{fontStyle:'italic',color:'#555'}}>Claimed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NGODashboard;
