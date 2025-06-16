import { render, screen, fireEvent } from "@testing-library/react";
import RegisterPage from "../pages/RegisterPage";

describe("RegisterPage", () => {
  test("renders the register form", () => {
    render(<RegisterPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /register/i })).toBeInTheDocument();
  });

  test("shows error when email is empty", () => {
    render(<RegisterPage />);
    const registerButton = screen.getByRole("button", { name: /register/i });
    fireEvent.click(registerButton);
    expect(screen.getByText(/please enter your email/i)).toBeInTheDocument();
  });

  test("shows error for invalid email format", () => {
    render(<RegisterPage />);
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: "invalidemail" } });
    const registerButton = screen.getByRole("button", { name: /register/i });
    fireEvent.click(registerButton);
    expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
  });
});
