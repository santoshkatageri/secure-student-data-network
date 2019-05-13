import capitalize from "lodash/fp/capitalize";
import { ReactNode } from "react";
import * as React from "react";
import { Button, Col, Container, Modal, Row } from "react-bootstrap";
import ConnectionRequest from "../../interfaces/connection-request";

interface ConnectionRequestModalProps {
  connectionRequest: ConnectionRequest;
  show: boolean;
  onClose: () => void;
}

const ConnectionAttribute = (props: { name: string; children: ReactNode }) => (
  <Row className="show-grid">
    <Col sm={3}>
      <p>
        <strong>{props.name}</strong>
      </p>
    </Col>
    <Col>{props.children}</Col>
  </Row>
);

export default function ConnectionRequestModal(props: ConnectionRequestModalProps) {
  const verificationCode = () => {
    if (props.connectionRequest.type === "provider") {
      return (
        <ConnectionAttribute name="Verification Code">
          <p className="text-info">{props.connectionRequest.verificationCode}</p>
        </ConnectionAttribute>
      );
    }
  };

  return (
    <Modal show={props.show} onHide={props.onClose} size="lg">
      <Modal.Header closeButton={true}>
        <Modal.Title>{capitalize(props.connectionRequest.type)} Connection Request</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container>
          <ConnectionAttribute name="Status">
            {capitalize(props.connectionRequest.status)}
          </ConnectionAttribute>
          <ConnectionAttribute name="Endpoint URL">
            <a href={props.connectionRequest.endpoint}>{props.connectionRequest.endpoint}</a>
          </ConnectionAttribute>
          <ConnectionAttribute name="Creation Date">
            {new Date(props.connectionRequest.creationDate).toLocaleString("en-US")}
          </ConnectionAttribute>
          <ConnectionAttribute name="First Name">
            {props.connectionRequest.firstName}
          </ConnectionAttribute>
          <ConnectionAttribute name="Last Name">
            {props.connectionRequest.lastName}
          </ConnectionAttribute>
          <ConnectionAttribute name="Organization">
            {props.connectionRequest.organization}
          </ConnectionAttribute>
          <ConnectionAttribute name="Title">{props.connectionRequest.title}</ConnectionAttribute>
          <ConnectionAttribute name="Email">
            <a href={`mailto:${props.connectionRequest.email}`}>{props.connectionRequest.email}</a>,
          </ConnectionAttribute>
          <ConnectionAttribute name="Phone Number">
            <a href={`tel:${props.connectionRequest.phoneNumber}`}>
              {props.connectionRequest.phoneNumber}
            </a>
          </ConnectionAttribute>
          <ConnectionAttribute name="Extension">
            {props.connectionRequest.extension}
          </ConnectionAttribute>
          {verificationCode()}
        </Container>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={props.onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}