import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Consultamos Firestore buscando coincidencia de Nombre y Contraseña
      const q = query(
        collection(db, "usuario"), 
        where("Nombre", "==", username), 
        where("Contraseña", "==", password)
      );
      
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Si hay coincidencia, iniciamos sesión (guardamos en localStorage para persistencia)
        localStorage.setItem('isAdmin', 'true');
        navigate('/admin');
      } else {
        setError('Usuario o contraseña incorrectos');
      }
    } catch (err) {
      console.error(err);
      setError('Error al conectar con la base de datos');
    }
  };

  return (
    <div className="container">
      <h1 className="graffiti-text neon-blue">Acceso Admin</h1>
      <form className="form-container" onSubmit={handleLogin}>
        <input 
          type="text" 
          placeholder="Usuario" 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required 
        />
        <input 
          type="password" 
          placeholder="Contraseña" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required 
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}