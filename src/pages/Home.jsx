import { useEffect, useState } from 'react';
import { db } from '../firebaseConfig'; // Ajusta la ruta a tu configuración
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const [eventosDestacados, setEventosDestacados] = useState([]);
  const [categoriasCarta, setCategoriasCarta] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarRemixHome = async () => {
      try {
        // 1. Traer eventos y recortar para mostrar solo los 2 primeros en la Home
        const eventosSnap = await getDoc(doc(db, 'data', 'eventos'));
        if (eventosSnap.exists() && eventosSnap.data().lista) {
          setEventosDestacados(eventosSnap.data().lista.slice(0, 2));
        }

        // 2. Traer las llaves de la carta (ej: "Cubatas", "Cachimbas") para listarlas como ganchos
        const cartaSnap = await getDoc(doc(db, 'data', 'carta'));
        if (cartaSnap.exists()) {
          setCategoriasCarta(Object.keys(cartaSnap.data()));
        }
      } catch (error) {
        console.error("Error cargando el remix de la Home:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarRemixHome();
  }, []);

  return (
    <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
      
      {/* Sección Principal / Hero */}
      <div style={{ 
        padding: '50px 20px', 
        background: 'linear-gradient(180deg, #111 0%, #000 100%)', 
        borderRadius: '15px', 
        marginBottom: '40px',
        border: '1px solid #222'
      }}>
        <h1 className="graffiti-text neon-pink" style={{ fontSize: '4.5rem', marginBottom: '10px', margin: 0 }}>
          Pub Friends
        </h1>
        <h2 className="neon-blue" style={{ fontSize: '1.8rem', fontWeight: '300', marginTop: '10px' }}>
          El mejor ambiente de Jaén
        </h2>
        <p style={{ fontSize: '1.2rem', color: '#aaa', marginTop: '20px', maxWidth: '600px', margin: '20px auto 0' }}>
          Música rompedora, copas premium, cachimbas top y el auténtico rollo underground que estabas buscando.
        </p>
      </div>

      {loading ? (
        <p style={{ color: '#fff' }}>Preparando la experiencia underground...</p>
      ) : (
        /* Contenedor Flexbox Responsivo (Remix) */
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '30px', 
          textAlign: 'left',
          justifyContent: 'center'
        }}>
          
          {/* GANCHO DE EVENTOS (Columna 1) */}
          <div style={{ 
            background: '#111', 
            padding: '30px', 
            borderRadius: '15px', 
            border: '1px solid #ff007f',
            flex: '1 1 400px', // Hace que se estire y baje en pantallas pequeñas
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 0 15px rgba(255, 0, 127, 0.1)'
          }}>
            <div>
              <h3 className="neon-pink" style={{ marginTop: '0', fontSize: '1.8rem' }}>🔥 Lo que se viene</h3>
              <p style={{ color: '#999', marginBottom: '20px' }}>No dejes que te lo cuenten. Échale un ojo a los próximos fiestones:</p>
              
              {eventosDestacados.length === 0 ? (
                <p style={{ color: '#555', fontStyle: 'italic' }}>Preparando grandes noches... Mantente atento.</p>
              ) : (
                <div style={{ display: 'grid', gap: '20px' }}>
                  {eventosDestacados.map((ev) => (
                    <div key={ev.id} style={{ borderBottom: '1px dashed #222', paddingBottom: '12px' }}>
                      <h4 style={{ margin: '0 0 5px 0', color: '#00ffff', fontSize: '1.3rem' }}>{ev.nombre}</h4>
                      <p style={{ margin: '0', fontSize: '0.95rem', color: '#ccc' }}>🕒 {ev.horario}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <button 
              onClick={() => navigate('/eventos')}
              style={{ 
                marginTop: '30px', 
                width: '100%', 
                padding: '12px', 
                background: '#ff007f', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                fontWeight: 'bold',
                fontSize: '1rem',
                boxShadow: '0 4px 10px rgba(255, 0, 127, 0.3)'
              }}
            >
              Ver Agenda Completa
            </button>
          </div>

          {/* GANCHO DE LA CARTA (Columna 2) */}
          <div style={{ 
            background: '#111', 
            padding: '30px', 
            borderRadius: '15px', 
            border: '1px solid #00ffff',
            flex: '1 1 400px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 0 15px rgba(0, 255, 255, 0.1)'
          }}>
            <div>
              <h3 className="neon-blue" style={{ marginTop: '0', fontSize: '1.8rem' }}>🍹 Para Calentar la Noche</h3>
              <p style={{ color: '#999', marginBottom: '25px' }}>Tenemos las mejores marcas listas para ti. ¿Qué te vas a pedir hoy?</p>
              
              {categoriasCarta.length === 0 ? (
                <p style={{ color: '#555', fontStyle: 'italic' }}>Cargando nuestra despensa...</p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {categoriasCarta.map((cat) => (
                    <span 
                      key={cat} 
                      style={{ 
                        background: '#1a1a1a', 
                        color: '#fff', 
                        padding: '10px 20px', 
                        borderRadius: '25px', 
                        border: '1px solid #333',
                        fontSize: '1rem',
                        fontWeight: '600',
                        boxShadow: '2px 2px 5px rgba(0,0,0,0.5)'
                      }}
                    >
                      ✨ {cat}
                    </span>
                  ))}
                </div>
              )}
              <p style={{ marginTop: '25px', fontSize: '0.85rem', color: '#666', lineHeight: '1.3' }}>
                * Consumiciones preparadas con la máxima dedicación y cachimbas de sabores premium seleccionados.
              </p>
            </div>
            
            <button 
              onClick={() => navigate('/carta')}
              style={{ 
                marginTop: '30px', 
                width: '100%', 
                padding: '12px', 
                background: '#00ffff', 
                color: '#000', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                fontWeight: 'bold',
                fontSize: '1rem',
                boxShadow: '0 4px 10px rgba(0, 255, 255, 0.3)'
              }}
            >
              Explorar la Carta Completa
            </button>
          </div>

        </div>
      )}
    </div>
  );
}