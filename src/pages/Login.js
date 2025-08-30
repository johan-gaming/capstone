import React,{useState,useRef} from 'react';
import {useNavigate} from 'react-router-dom';
import {auth,db} from '../firebaseConfig';
import {createUserWithEmailAndPassword,signInWithEmailAndPassword} from 'firebase/auth';
import {doc,setDoc,getDoc} from 'firebase/firestore';

const Login = () => {
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [role,setRole] = useState('donor');
  const [isRegistering,setIsRegistering] = useState(false);
  const [name,setName] = useState('');
  const passwordRef = useRef(null);
  const navigate = useNavigate();

  const handleSubmit = async(e) => {
    e.preventDefault();
    try {
      if(isRegistering){
        // ✅ Create user with Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth,email,password);
        const user = userCredential.user;

        // ✅ Save extra fields (name + role) in Firestore
        await setDoc(doc(db,'users',user.uid),{
          name,
          email,
          role
        });

        // ✅ Redirect based on role
        if(role === 'ngo'){
          navigate('/ngo-dashboard');
        } else {
          navigate('/donor-dashboard');
        }

      } else {
        // ✅ Login existing user
        const userCredential = await signInWithEmailAndPassword(auth,email,password);
        const user = userCredential.user;

        // ✅ Fetch role from Firestore
        const docRef = doc(db,'users',user.uid);
        const docSnap = await getDoc(docRef);

        if(docSnap.exists()){
          const data = docSnap.data();
          if(data.role === 'ngo'){
            navigate('/ngo-dashboard');
          } else if(data.role === 'donor'){
            navigate('/donor-dashboard');
          } else {
            alert('Unknown role. Please contact admin.');
          }
        } else {
          alert('No user profile found.');
        }
      }
    } catch(err){
      alert(err.message);
    }
  };

  return (
    <div style={{
      display:'flex',
      justifyContent:'center',
      alignItems:'center',
      minHeight:'100vh',
      backgroundColor:'#f9f9f9'
    }}>
      <div style={{
        backgroundColor:'#fff',
        padding:'2rem',
        borderRadius:'0.75rem',
        width:'100%',
        maxWidth:'400px',
        boxShadow:'0 4px 15px rgba(0,0,0,0.1)',
        textAlign:'center'
      }}>
        <h2 style={{
          marginBottom:'1.5rem',
          fontWeight:'bold'
        }}>
          {isRegistering ? 'Register' : 'Login'}
        </h2>

        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column'}}>
          {isRegistering && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e)=>setName(e.target.value)}
              style={{
                padding:'0.75rem',
                marginBottom:'1rem',
                border:'1px solid #ccc',
                borderRadius:'0.5rem',
                fontSize:'1rem',
                backgroundColor:'#f3f6ff'
              }}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            onKeyDown={(e)=> e.key==='Enter' && passwordRef.current.focus()}
            style={{
              padding:'0.75rem',
              marginBottom:'1rem',
              border:'1px solid #ccc',
              borderRadius:'0.5rem',
              fontSize:'1rem',
              backgroundColor:'#f3f6ff'
            }}
            required
          />
          <input
            type="password"
            ref={passwordRef}
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            style={{
              padding:'0.75rem',
              marginBottom:'1rem',
              border:'1px solid #ccc',
              borderRadius:'0.5rem',
              fontSize:'1rem',
              backgroundColor:'#f3f6ff'
            }}
            required
          />
          {isRegistering && (
            <select
              value={role}
              onChange={(e)=>setRole(e.target.value)}
              style={{
                padding:'0.75rem',
                marginBottom:'1rem',
                border:'1px solid #ccc',
                borderRadius:'0.5rem',
                fontSize:'1rem'
              }}
            >
              <option value="donor">Donor</option>
              <option value="ngo">NGO</option>
            </select>
          )}
          <button type="submit" style={{
            padding:'0.75rem',
            backgroundColor:'#000',
            color:'#fff',
            border:'none',
            borderRadius:'0.5rem',
            cursor:'pointer',
            fontSize:'1rem',
            fontWeight:'bold'
          }}>
            {isRegistering ? 'Sign Up' : 'Log In'}
          </button>
        </form>

        <p 
          onClick={()=>setIsRegistering(!isRegistering)}
          style={{
            marginTop:'1rem',
            cursor:'pointer',
            color:'#000',
            textAlign:'center'
          }}
        >
          {isRegistering ? 'Already have an account? Login' : 'No account? Register here'}
        </p>
      </div>
    </div>
  );
};

export default Login;
