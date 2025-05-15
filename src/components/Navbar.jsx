import { Link } from "react-router-dom";
import { useContext } from 'react';
import { AuthContext } from "../context/authContext";

import NavbarBs from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import NavDropdown from "react-bootstrap/NavDropdown";

const Navbar = () => {
  const { userEmail, logout } = useContext(AuthContext);

  return (
    <NavbarBs expand="lg" className="bg-body-tertiary mb-3">
      <Container>
        <NavbarBs.Brand as={Link} to="/">MiApp</NavbarBs.Brand>
        <NavbarBs.Toggle aria-controls="basic-navbar-nav" />
        <NavbarBs.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Inicio</Nav.Link>
            
            {/* Dropdown con Gastos y Familia (condicional) */}
            <NavDropdown title="Datos" id="basic-nav-dropdown"> {/* Cambiado el título del dropdown */}
              <NavDropdown.Item as={Link} to="/gastos">Gastos</NavDropdown.Item>
              {userEmail && (
                <>
                  <NavDropdown.Item as={Link} to="/familia">Familia</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/arbol">Árbol Genealógico</NavDropdown.Item>
                </>
              )}
            </NavDropdown>
          </Nav>
          <Nav>
            {userEmail ? (
              <>
                <NavbarBs.Text className="me-3">
                  Bienvenido, {userEmail}
                </NavbarBs.Text>
                <Button variant="outline-secondary" size="sm" onClick={logout}>Cerrar sesión</Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Iniciar sesión</Nav.Link>
                <Nav.Link as={Link} to="/register">Registrarse</Nav.Link>
              </>
            )}
          </Nav>
        </NavbarBs.Collapse>
      </Container>
    </NavbarBs>
  );
};

export default Navbar;
