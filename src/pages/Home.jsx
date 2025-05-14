import { useState, useEffect } from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';

const Home = () => {
  const [joke, setJoke] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchJoke = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('https://v2.jokeapi.dev/joke/Programming?lang=es');
      if (!response.ok) throw new Error('Error al cargar el chiste');
      const data = await response.json();
      
      // Format the joke based on type
      const formattedJoke = data.type === 'single' 
        ? data.joke
        : `${data.setup}\n${data.delivery}`;
      
      setJoke(formattedJoke);
    } catch {
      setError('No se pudo cargar el chiste. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch a joke when component mounts
  useEffect(() => {
    fetchJoke();
  }, []);

  return (
    <div className="home-page-background">
      <img 
        src="./fotos/unaFamilia.png" 
        alt="Familia" 
        className="home-background-image"
      />
      <div className="home-content">
        <h1 className="home-title">Bienvenidos a la página familiar</h1>
        <p className="home-text">Por favor, inicia sesión para acceder a tus gastos y familia.</p>
        
        {/* Joke Card */}
        <Card className="mt-4 mx-auto" style={{ maxWidth: '600px' }}>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <span>Chiste del día</span>
            <Button 
              variant="outline-primary" 
              size="sm" 
              onClick={fetchJoke}
              disabled={loading}
            >
              {loading ? 'Cargando...' : 'Nuevo chiste'}
            </Button>
          </Card.Header>
          <Card.Body>
            {error ? (
              <p className="text-danger">{error}</p>
            ) : loading ? (
              <p>Cargando chiste...</p>
            ) : (
              <p style={{ whiteSpace: 'pre-line' }}>{joke}</p>
            )}
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default Home;
