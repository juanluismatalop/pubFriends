import { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
// Cambiamos 'collection' y 'getDocs' por 'doc' y 'getDoc' porque leemos UN solo documento
import { doc, getDoc } from 'firebase/firestore';

export default function Carta() {
  const [cartaData, setCartaData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const obtenerCarta = async () => {
      try {
        // Apuntamos directamente a la colección "data" y al documento "carta"
        const docRef = doc(db, "data", "carta");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          // Guardamos todo el objeto (que tendrá "Cubatas", y las categorías que añadas)
          setCartaData(docSnap.data());
        } else {
          console.log("No se encontró el documento 'carta' en la colección 'data'");
        }
        setLoading(false);
      } catch (error) {
        console.error("Error al traer la carta: ", error);
        setLoading(false);
      }
    };

    obtenerCarta();
  }, []);

  if (loading) {
    return (
      <div className="container">
        <h2 className="neon-blue">Cargando la carta...</h2>
      </div>
    );
  }

  // Extraemos los nombres de las categorías (ej: ["Cubatas"])
  const categorias = Object.keys(cartaData);

  return (
    <div className="container">
      <h1 className="graffiti-text neon-pink" style={{ marginBottom: '40px' }}>
        La Carta de Friends
      </h1>

      {categorias.length === 0 ? (
        <p>Aún no hay categorías en la carta. </p>
      ) : (
        <div className="carta-grid">
          {categorias.map((categoria, index) => (
            <div key={categoria} className="categoria-card">
              {/* Título de la categoría (ej: Cubatas) con neón alternado */}
              <h2 className={index % 2 === 0 ? "neon-cat-pink" : "neon-cat-blue"}>
                {categoria}
              </h2>
              
              {/* Recorremos el Array de productos de esta categoría específica */}
              {Array.isArray(cartaData[categoria]) && 
                cartaData[categoria].map((producto, idx) => (
                  <div key={idx} className="producto-item">
                    {/* Respetamos las mayúsculas/minúsculas exactas de tu Firestore */}
                    <span className="producto-nombre">{producto.nombre}</span>
                    <div className="producto-linea"></div>
                    <span className="producto-precio">{producto.precio}</span>
                  </div>
                ))//pi
              }
            </div>
          ))}
        </div>
      )}
    </div>
  );
}