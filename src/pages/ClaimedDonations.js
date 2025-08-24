import React, {useState} from 'react'
import './Dashboard.css'

const DonorDashboard = () => {
  const [donations, setDonations] = useState([])
  const [showTable, setShowTable] = useState(false)
  const [formData, setFormData] = useState({food:'', quantity:''})

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value})
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if(formData.food && formData.quantity){
      setDonations([...donations, formData])
      setFormData({food:'', quantity:''})
      setShowTable(true) // 👈 show table only after posting
    }
  }

  return (
    <div className="dashboard-container fade-in">
      <h1 className="dashboard-title">Donor Dashboard</h1>

      {/* Donation Form */}
      <form className="donation-form" onSubmit={handleSubmit}>
        <input 
          type="text" 
          name="food" 
          placeholder="Enter food item" 
          value={formData.food} 
          onChange={handleChange} 
          required
        />
        <input 
          type="number" 
          name="quantity" 
          placeholder="Enter quantity" 
          value={formData.quantity} 
          onChange={handleChange} 
          required
        />
        <button type="submit">Post Donation</button>
      </form>

      {/* Donation Table - only shows after posting */}
      {showTable && (
        <div className="donation-history">
          <h2>Donation History</h2>
          <table className="donation-table">
            <thead>
              <tr>
                <th>Food</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((donation, index) => (
                <tr key={index}>
                  <td>{donation.food}</td>
                  <td>{donation.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default DonorDashboard
