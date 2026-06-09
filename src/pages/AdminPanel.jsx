import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig'; // Asegúrate de que la ruta a tu config de Firebase sea correcta
import { doc, getDoc, updateDoc, deleteField } from 'firebase/firestore';

export default function AdminPanel() {
  const navigate = useNavigate();
  
  // Estados para datos de Firebase
  const [carta, setCarta] = useState({});
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para los formularios
  const [activeTab, setActiveTab] = useState('carta'); // 'carta' o 'eventos'
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [nuevoProducto, setNuevoProducto] = useState({ categoria: '', nombre: '', precio: '' });
  const [nuevoEvento, setNuevoEvento] = useState({ nombre: '', duracion: '', horario: '', descripcion: '' });

  // Referencias a los documentos de Firestore
  const cartaDocRef = doc(db, 'data', 'carta');
  const eventosDocRef = doc(db, 'data', 'eventos');

  useEffect(() => {
    // Protección de ruta básica
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
      navigate('/login');
      return;
    }
    cargarDatos();
  }, [navigate]);

  // Obtener datos iniciales de Firestore
  const cargarDatos = async () => {
    try {
      setLoading(false);
      // Cargar Carta
      const cartaSnap = await getDoc(cartaDocRef);
      if (cartaSnap.exists()) {
        setCarta(cartaSnap.data());
      }

      // Cargar Eventos
      const eventosSnap = await getDoc(eventosDocRef);
      if (eventosSnap.exists() && eventosSnap.data().lista) {
        setEventos(eventosSnap.data().lista);
      } else {
        setEventos([]);
      }
    } catch (error) {
      console.error("Error al cargar datos de Firestore:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    navigate('/');
  };

  // ==========================================
  // LÓGICA DE LA CARTA (Categorías y Productos)
  // ==========================================

  const crearCategoria = async (e) => {
    e.preventDefault();
    if (!nuevaCategoria.trim()) return;
    
    try {
      // Si ya existe la categoría localmente, avisamos
      if (carta[nuevaCategoria]) {
        alert("La categoría ya existe.");
        return;
      }
      
      // En Firestore creamos un campo nuevo con un array vacío
      await updateDoc(cartaDocRef, {
        [nuevaCategoria]: []
      });
      
      setNuevaCategoria('');
      cargarDatos(); // Recargamos la interfaz
    } catch (error) {
      console.error("Error al crear categoría:", error);
    }
  };

  const eliminarCategoria = async (catNombre) => {
    if (!window.confirm(`¿Seguro que quieres eliminar la categoría "${catNombre}" y todos sus productos?`)) return;
    
    try {
      await updateDoc(cartaDocRef, {
        [catNombre]: deleteField()
      });
      cargarDatos();
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
    }
  };

  const añadirProducto = async (e) => {
    e.preventDefault();
    const { categoria, nombre, precio } = nuevoProducto;
    if (!categoria || !nombre || !precio) {
      alert("Por favor, rellena todos los campos del producto.");
      return;
    }

    try {
      // Obtenemos los productos actuales de esa categoría
      const productosActuales = carta[categoria] || [];
      const nuevosProductos = [...productosActuales, { nombre, precio: `${precio}€` }];

      await updateDoc(cartaDocRef, {
        [categoria]: nuevosProductos
      });

      setNuevoProducto({ categoria: '', nombre: '', precio: '' });
      cargarDatos();
    } catch (error) {
      console.error("Error al añadir producto:", error);
    }
  };

  const eliminarProducto = async (categoria, indexEliminar) => {
    try {
      const nuevosProductos = carta[categoria].filter((_, index) => index !== indexEliminar);
      
      await updateDoc(cartaDocRef, {
        [categoria]: nuevosProductos
      });
      cargarDatos();
    } catch (error) {
      console.error("Error al eliminar producto:", error);
    }
  };

  // ==========================================
  // LÓGICA DE LOS EVENTOS
  // ==========================================

  const crearEvento = async (e) => {
    e.preventDefault();
    const { nombre, duracion, horario, descripcion } = nuevoEvento;
    if (!nombre || !duracion || !horario) {
      alert("Nombre, duración y horario son obligatorios.");
      return;
    }

    try {
      const nuevosEventos = [...eventos, { ...nuevoEvento, id: Date.now().toString() }];
      
      // Guardamos la lista actualizada de eventos en el documento "eventos"
      await updateDoc(eventosDocRef, {
        lista: nuevosEventos
      });

      setNuevoEvento({ nombre: '', duracion: '', horario: '', descripcion: '' });
      cargarDatos();
    } catch (error) {
      console.error("Error al crear evento:", error);
    }
  };

  const eliminarEvento = async (idEvento) => {
    if (!window.confirm("¿Seguro que quieres borrar este evento?")) return;

    try {
      const nuevosEventos = eventos.filter(ev => ev.id !== idEvento);
      await updateDoc(eventosDocRef, {
        lista: nuevosEventos
      });
      cargarDatos();
    } catch (error) {
      console.error("Error al eliminar evento:", error);
    }
  };

  if (loading) return <div className="container"><p>Cargando datos del panel...</p></div>;

  return (
    <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <h1 className="graffiti-text neon-pink">Panel de Control</h1>
      <p>Bienvenido, administrador.</p>
      
      {/* Selector de pestañas */}
      <div style={{ marginTop: '20px', display: 'flex', gap: '20px', justifyContent: 'center' }}>
        <button 
          onClick={() => setActiveTab('carta')} 
          style={{ backgroundColor: activeTab === 'carta' ? '#ff007f' : '#333' }}
        >
          Gestionar Carta
        </button>
        <button 
          onClick={() => setActiveTab('eventos')} 
          style={{ backgroundColor: activeTab === 'eventos' ? '#ff007f' : '#333' }}
        >
          Gestionar Eventos
        </button>
      </div>

      <hr style={{ margin: '30px 0', borderColor: '#444' }} />

      {/* SECCIÓN DE LA CARTA */}
      {activeTab === 'carta' && (
        <div>
          <h2 className="neon-blue">Gestión de la Carta</h2>
          
          {/* Formulario Crear Categoría */}
          <div style={{ background: '#222', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            <h3>Crear Nueva Categoría</h3>
            <form onSubmit={crearCategoria} style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                placeholder="Ej: Batidos, Shishas Premium" 
                value={nuevaCategoria}
                onChange={(e) => setNuevaCategoria(e.target.value)}
                style={{ flex: 1, padding: '8px' }}
              />
              <button type="submit">Crear Categoría</button>
            </form>
          </div>

          {/* Formulario Añadir Producto */}
          <div style={{ background: '#222', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            <h3>Añadir Producto a Categoría</h3>
            <form onSubmit={añadirProducto} style={{ display: 'grid', gap: '10px', gridTemplateColumns: '1fr 1fr 1fr auto' }}>
              <select 
                value={nuevoProducto.categoria} 
                onChange={(e) => setNuevoProducto({...nuevoProducto, categoria: e.target.value})}
                style={{ padding: '8px' }}
              >
                <option value="">-- Selecciona Categoría --</option>
                {Object.keys(carta).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <input 
                type="text" 
                placeholder="Nombre del producto" 
                value={nuevoProducto.nombre}
                onChange={(e) => setNuevoProducto({...nuevoProducto, nombre: e.target.value})}
                style={{ padding: '8px' }}
              />
              <input 
                type="text" 
                placeholder="Precio (Ej: 12,00)" 
                value={nuevoProducto.precio}
                onChange={(e) => setNuevoProducto({...nuevoProducto, precio: e.target.value})}
                style={{ padding: '8px' }}
              />
              <button type="submit">Añadir</button>
            </form>
          </div>

          {/* Vista previa y edición de la Carta actual */}
          <h3>Estructura de la Carta Actual</h3>
          {Object.keys(carta).length === 0 ? <p>No hay categorías creadas.</p> : (
            Object.keys(carta).map(categoria => (
              <div key={categoria} style={{ border: '1px solid #444', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', justifyContent: 'space-between' }}>
                  <strong style={{ fontSize: '1.2rem', color: '#ff007f' }}>{categoria}</strong>
                  <button 
                    onClick={() => eliminarCategoria(categoria)} 
                    style={{ background: 'darkred', padding: '4px 10px', fontSize: '0.8rem' }}
                  >
                    Eliminar Categoría
                  </button>
                </div>
                
                <ul style={{ listStyleType: 'none', paddingLeft: 0, marginTop: '10px' }}>
                  {carta[categoria].map((prod, index) => (
                    <li key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px dashed #333' }}>
                      <span>{prod.nombre} - <span style={{ color: '#00ffff' }}>{prod.precio}</span></span>
                      <button 
                        onClick={() => eliminarProducto(categoria, index)} 
                        style={{ background: 'none', color: 'red', border: 'none', cursor: 'pointer' }}
                      >
                        ✕ Borrar
                      </button>
                    </li>
                  ))}
                  {carta[categoria].length === 0 && <li style={{ color: '#666' }}>Sin productos en esta categoría.</li>}
                </ul>
              </div>
            ))
          )}
        </div>
      )}

      {/* SECCIÓN DE LOS EVENTOS */}
      {activeTab === 'eventos' && (
        <div>
          <h2 className="neon-blue">Gestión de Eventos</h2>

          {/* Formulario Crear Evento */}
          <div style={{ background: '#222', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            <h3>Crear Nuevo Evento</h3>
            <form onSubmit={crearEvento} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input 
                type="text" 
                placeholder="Nombre del Evento (Ej: Fiesta Universitaria)" 
                value={nuevoEvento.nombre}
                onChange={(e) => setNuevoEvento({...nuevoEvento, nombre: e.target.value})}
                style={{ padding: '8px' }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  placeholder="Duración (Ej: 6 horas)" 
                  value={nuevoEvento.duracion}
                  onChange={(e) => setNuevoEvento({...nuevoEvento, duracion: e.target.value})}
                  style={{ flex: 1, padding: '8px' }}
                />
                <input 
                  type="text" 
                  placeholder="Horario (Ej: 23:00 a 05:00)" 
                  value={nuevoEvento.horario}
                  onChange={(e) => setNuevoEvento({...nuevoEvento, horario: e.target.value})}
                  style={{ flex: 1, padding: '8px' }}
                />
              </div>
              <textarea 
                placeholder="Descripción o detalles opcionales" 
                value={nuevoEvento.descripcion}
                onChange={(e) => setNuevoEvento({...nuevoEvento, descripcion: e.target.value})}
                style={{ padding: '8px', minHeight: '60px' }}
              />
              <button type="submit" style={{ alignSelf: 'center', width: '200px' }}>Crear Evento</button>
            </form>
          </div>

          {/* Lista de Eventos */}
          <h3>Eventos Planificados</h3>
          {eventos.length === 0 ? <p>No hay eventos creados actualmente.</p> : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {eventos.map((evento) => (
                <div key={evento.id} style={{ background: '#1a1a1a', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #00ffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 5px 0', color: '#ff007f' }}>{evento.nombre}</h4>
                    <p style={{ margin: '2px 0', fontSize: '0.9rem' }}>🕒 <b>Horario:</b> {evento.horario} | ⏳ <b>Duración:</b> {evento.duracion}</p>
                    {evento.descripcion && <p style={{ margin: '5px 0 0 0', color: '#aaa', fontSize: '0.85rem' }}>{evento.descripcion}</p>}
                  </div>
                  <button 
                    onClick={() => eliminarEvento(evento.id)} 
                    style={{ background: 'darkred', padding: '6px 12px' }}
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <br/><br/>
      <button onClick={handleLogout} style={{ borderColor: 'red', color: 'red', boxShadow: 'none', display: 'block', margin: '0 auto' }}>
        Cerrar Sesión
      </button>
    </div>
  );
}