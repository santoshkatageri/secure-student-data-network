import "@testing-library/jest-dom/extend-expect";

import React from "react";

import { renderWithRouter } from "../../../test-support/test-helper";
import Header from "./Header";

describe("<Header />", () => {
  it("renders the navigation links", () => {
    const { getByText } = renderWithRouter(<Header />);

    expect(getByText(/home/i)).toHaveAttribute("href", "/");
    expect(getByText(/connections/i)).toHaveAttribute("href", "/connections");
    expect(getByText(/logs/i)).toHaveAttribute("href", "/logs");
    expect(getByText(/users/i)).toHaveAttribute("href", "/users");
    expect(getByText(/settings/i)).toHaveAttribute("href", "/settings");
    expect(getByText(/file transfers/i)).toHaveAttribute("href", "/file-transfers");
  });
});
