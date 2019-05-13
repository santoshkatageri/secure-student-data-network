import React from "react";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { LinkContainer } from "react-router-bootstrap";
import logo from "../../logo.svg";
import "./Header.css";

const Header = () => (
  <header className="App-header">
    <Navbar bg="primary" variant="dark">
      <Navbar.Brand href="https://github.com/learningtapestry/nucleus">
        <img
          alt="Nucleus logo"
          src={logo}
          width="30"
          height="30"
          className="Header-logo d-inline-block align-top"
        />
        {"Nucleus"}
      </Navbar.Brand>
      <Nav className="mr-auto">
        <LinkContainer to="/" exact={true}>
          <Nav.Link>Home</Nav.Link>
        </LinkContainer>
        <LinkContainer to="/providers">
          <Nav.Link>Providers</Nav.Link>
        </LinkContainer>
        <LinkContainer to="/consumers">
          <Nav.Link>Consumers</Nav.Link>
        </LinkContainer>
        <LinkContainer to="/logs">
          <Nav.Link>Logs</Nav.Link>
        </LinkContainer>
        <LinkContainer to="/users">
          <Nav.Link>Users</Nav.Link>
        </LinkContainer>
        <LinkContainer to="/settings">
          <Nav.Link>Settings</Nav.Link>
        </LinkContainer>
      </Nav>
    </Navbar>
  </header>
);

export default Header;