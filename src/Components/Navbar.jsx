import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav>
      <Link to="/">Inicio</Link>
      <Link to="/carta">Carta</Link>
      <Link to="/eventos">Eventos</Link>

    </nav>
  );
}