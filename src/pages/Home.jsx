const Home = () => {
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
      </div>
    </div>
  );
};
export default Home;
