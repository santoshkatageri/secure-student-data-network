import { createMemoryHistory } from "history";
import React from "react";
import { Router } from "react-router-dom";
import { render } from "react-testing-library";

export function renderWithRouter(
  ui: JSX.Element,
  { route = "/", history = createMemoryHistory({ initialEntries: [route] }) } = {},
) {
  return {
    ...render(<Router history={history}>{ui}</Router>),
    history,
  };
}
