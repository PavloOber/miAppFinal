import { useState, useEffect, useCallback } from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";

const Home = () => {
  const [jokes, setJokes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [amount, setAmount] = useState(1);

  const fetchJokes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`https://v2.jokeapi.dev/joke/Any?lang=es&amount=${amount}`);
      if (!response.ok) throw new Error("Error al cargar los chistes");
      const data = await response.json();

      // Format the jokes consistently
      if (amount === 1) {
        // Single joke response (data is the joke itself)
        const formattedJoke = {
          id: 1,
          type: data.type,
          content: data.type === "single" ? data.joke : { setup: data.setup, delivery: data.delivery }
        };
        setJokes([formattedJoke]);
      } else {
        // Multiple jokes response (data.jokes is an array)
        const formattedJokes = data.jokes.map((joke, index) => ({
          id: index + 1,
          type: joke.type,
          content: joke.type === "single" ? joke.joke : { setup: joke.setup, delivery: joke.delivery }
        }));
        setJokes(formattedJokes);
      }
    } catch {
      setError("No se pudo cargar los chistes. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }, [amount]);

  // Fetch jokes when component mounts
  useEffect(() => {
    fetchJokes();
  }, [fetchJokes]);

  return (
    <div className="home-page-background">
      <img
        src="./fotos/unaFamilia.png"
        alt="Familia"
        className="home-background-image"
      />
      <div className="home-content">
        <h1 className="home-title">Bienvenidos a la página familiar</h1>
        <p className="home-text">
          Por favor, inicia sesión para acceder a tus gastos y familia.
        </p>

        {/* Jokes Card */}
        <Card className="mt-4 mx-auto" style={{ maxWidth: "800px" }}>
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span>Chistes del día</span>
              <div className="d-flex gap-2 align-items-center">
                <select 
                  className="form-select form-select-sm" 
                  style={{ width: "auto" }}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  disabled={loading}
                >
                  <option value="1">1 chiste</option>
                  <option value="2">2 chistes</option>
                  <option value="3">3 chistes</option>
                  <option value="5">5 chistes</option>
                </select>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={fetchJokes}
                  disabled={loading}
                >
                  {loading ? "Cargando..." : "Nuevos chistes"}
                </Button>
              </div>
            </div>
          </Card.Header>
          <Card.Body>
            {error ? (
              <p className="text-danger">{error}</p>
            ) : loading ? (
              <p>Cargando chistes...</p>
            ) : (
              <div className="d-flex flex-column gap-4">
                {jokes.map((joke) => (
                  <div key={joke.id} className="border-bottom pb-3">
                    {joke.type === "single" ? (
                      <p style={{ whiteSpace: "pre-line" }}>{joke.content}</p>
                    ) : (
                      <>
                        <p className="mb-2"><strong>Pregunta:</strong> {joke.content.setup}</p>
                        <p><strong>Respuesta:</strong> {joke.content.delivery}</p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default Home;
