import "./App.css";

import {
  ConfirmSignIn,
  ForgotPassword,
  Greetings,
  Loading,
  RequireNewPassword,
  SignIn,
  TOTPSetup,
  VerifyContact,
  withAuthenticator,
} from "aws-amplify-react/dist/Auth";
import { createBrowserHistory } from "history";
import React, { Component } from "react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import { Route, Router } from "react-router-dom";

import ConnectionsHome from "./components/connection-requests/ConnectionsHome";
import FileTransfersHome from "./components/file-transfers/FileTransfersHome";
import CreateFormat from "./components/formats/CreateFormat";
import EditFormat from "./components/formats/EditFormat";
import Formats from "./components/formats/Formats";
import Home from "./components/home/Home";
import Logs from "./components/logs/Logs";
import Settings from "./components/settings/Settings";
import Header from "./components/ui/Header";
import CreateUser from "./components/users/CreateUser";
import Users from "./components/users/Users";

const sharedHistory = createBrowserHistory();
if ((window as any).Cypress) {
  (window as any).sharedHistory = sharedHistory;
}

class App extends Component {
  public render() {
    return (
      <Router history={sharedHistory}>
        <div className="App">
          <Header />
          <Container fluid={true} className="mt-3">
            <Row>
              <Col>
                <Route exact={true} path="/" component={Home} />
                <Route exact={true} path="/logs" component={Logs} />
                <Route path="/connections" component={ConnectionsHome} />
                <Route exact={true} path="/formats" component={Formats} />
                <Route exact={true} path="/formats/create" component={CreateFormat} />
                <Route exact={true} path="/formats/:name/edit" component={EditFormat} />
                <Route exact={true} path="/users" component={Users} />
                <Route exact={true} path="/users/create" component={CreateUser} />
                <Route exact={true} path="/settings" component={Settings} />
                <Route path="/file-transfers" component={FileTransfersHome} />
              </Col>
            </Row>
          </Container>
        </div>
      </Router>
    );
  }
}

export default withAuthenticator(App, true, [
  <Greetings key="greetings" />,
  <SignIn key="signIn" />,
  <ConfirmSignIn key="confirmSignIn" />,
  <VerifyContact key="verifyContact" />,
  <ForgotPassword key="ForgotPassword" />,
  <TOTPSetup key="TOTPSetup" />,
  <RequireNewPassword key="RequireNewPassword" />,
  <Loading key="loading" />,
]);
