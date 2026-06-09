import { useEffect, useState } from 'react';
import { db } from '../firebaseConfig'; // Ajusta la ruta a tu archivo de configuración
import { doc, getDoc } from 'firebase/firestore';

export default function Eventos() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const obtenerEventos = async () => {
      try {
        const docRef = doc(db, 'data', 'eventos');
        const snap = await getDoc(docRef);
        if (snap.exists() && snap.data().lista) {
          setEventos(snap.data().lista);
        }
      } catch (error) {
        console.error("Error cargando eventos:", error);
      } finally {
        setLoading(false);
      }
    };

    obtenerEventos();
  }, []);

  return (
    <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1 className="graffiti-text neon-pink">Próximos Eventos</h1>
      
      {loading ? (
        <p style={{ textAlign: 'center', marginTop: '30px', color: '#fff' }}>Cargando noches épicas...</p>
      ) : eventos.length === 0 ? (
        <p style={{ textAlign: 'center', marginTop: '30px', color: '#666', fontStyle: 'italic' }}>
          No hay eventos programados por ahora. ¡Vuelve pronto!
        </p>
      ) : (
        <div style={{ marginTop: '30px', display: 'grid', gap: '25px' }}>
          {eventos.map((evento) => (
            <div 
              key={evento.id} 
              style={{ 
                background: '#111', 
                padding: '25px', 
                borderRadius: '12px', 
                borderLeft: '5px solid #ff007f',
                boxShadow: '0 0 15px rgba(255, 0, 127, 0.15)',
                textAlign: 'left'
              }}
            >
              <h3 className="neon-blue" style={{ margin: '0 0 10px 0', fontSize: '1.6rem' }}>
                {evento.nombre}
              </h3>
              <p style={{ margin: '5px 0', fontSize: '1.1rem', color: '#fff' }}>
                🕒 <b>Horario:</b> {evento.horario} 
                <span style={{ margin: '0 15px', color: '#333' }}>|</span> 
                ⏳ <b>Duración:</b> {evento.duracion}
              </p>
              {evento.descripcion && (
                <p style={{ margin: '15px 0 0 0', color: '#aaa', fontStyle: 'italic', lineHeight: '1.4' }}>
                  {evento.descripcion}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}