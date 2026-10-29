import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";

import HelpRequestForm from "main/components/HelpRequest/HelpRequestForm";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";

const mockedNavigate = vi.fn();

vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");

  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("HelpRequestForm tests", () => {
  const testId = "HelpRequestForm";

  const expectedLabels = [
    "Requester Email",
    "Team ID",
    "Table or Breakout Room",
    "Request Time",
    "Explanation",
    "Solved",
  ];

  const renderForm = (props = {}) => {
    return render(
      <Router>
        <HelpRequestForm {...props} />
      </Router>,
    );
  };

  const submitForm = () => {
    const submitButton = screen.getByTestId(`${testId}-submit`);
    fireEvent.submit(submitButton.closest("form"));
  };

  const fillValidFields = () => {
    fireEvent.change(screen.getByTestId(`${testId}-requesterEmail`), {
      target: { value: "ckohlbrecher@ucsb.edu" },
    });

    fireEvent.change(screen.getByTestId(`${testId}-teamId`), {
      target: { value: "f26-03" },
    });

    fireEvent.change(screen.getByTestId(`${testId}-tableOrBreakoutRoom`), {
      target: { value: "table_03" },
    });

    fireEvent.change(screen.getByTestId(`${testId}-requestTime`), {
      target: { value: "2026-10-20T11:30" },
    });

    fireEvent.change(screen.getByTestId(`${testId}-explanation`), {
      target: { value: "Need help with Java" },
    });
  };

  test("renders correctly in create mode", () => {
    renderForm();

    expectedLabels.forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-submit`)).toHaveTextContent("Create");

    expect(screen.queryByTestId(`${testId}-id`)).not.toBeInTheDocument();

    expect(screen.getByTestId(`${testId}-solved`)).not.toBeChecked();
  });

  test("renders correctly in edit mode", () => {
    renderForm({
      initialContents: helpRequestFixtures.oneHelpRequest,
      buttonLabel: "Update",
    });

    expect(screen.getByTestId(`${testId}-id`)).toHaveValue("1");

    expect(screen.getByTestId(`${testId}-id`)).toHaveAttribute("readonly");

    expect(screen.getByTestId(`${testId}-requesterEmail`)).toHaveValue(
      "ckohlbrecher@ucsb.edu",
    );

    expect(screen.getByTestId(`${testId}-teamId`)).toHaveValue("f26-03");

    expect(screen.getByTestId(`${testId}-tableOrBreakoutRoom`)).toHaveValue(
      "table_03",
    );

    expect(screen.getByTestId(`${testId}-explanation`)).toHaveValue(
      "Need help debugging a Java program",
    );

    expect(screen.getByTestId(`${testId}-submit`)).toHaveTextContent("Update");
  });

  test("displays required field validation errors", async () => {
    const mockSubmitAction = vi.fn();

    renderForm({ submitAction: mockSubmitAction });

    submitForm();

    expect(
      await screen.findByText("Requester email is required."),
    ).toBeInTheDocument();

    expect(screen.getByText("Team ID is required.")).toBeInTheDocument();

    expect(
      screen.getByText("Table or breakout room is required."),
    ).toBeInTheDocument();

    expect(screen.getByText("Request time is required.")).toBeInTheDocument();

    expect(screen.getByText("Explanation is required.")).toBeInTheDocument();

    expect(mockSubmitAction).not.toHaveBeenCalled();
  });

  test("rejects an invalid email address", async () => {
    const mockSubmitAction = vi.fn();

    renderForm({ submitAction: mockSubmitAction });

    fillValidFields();

    fireEvent.change(screen.getByTestId(`${testId}-requesterEmail`), {
      target: { value: "invalid-email" },
    });

    submitForm();

    expect(
      await screen.findByText("Please enter a valid email address."),
    ).toBeInTheDocument();

    expect(mockSubmitAction).not.toHaveBeenCalled();
  });

  test("rejects whitespace-only text fields", async () => {
    const mockSubmitAction = vi.fn();

    renderForm({ submitAction: mockSubmitAction });

    fillValidFields();

    fireEvent.change(screen.getByTestId(`${testId}-teamId`), {
      target: { value: "   " },
    });

    fireEvent.change(screen.getByTestId(`${testId}-tableOrBreakoutRoom`), {
      target: { value: "   " },
    });

    fireEvent.change(screen.getByTestId(`${testId}-explanation`), {
      target: { value: "   " },
    });

    submitForm();

    expect(
      await screen.findByText("Team ID cannot be blank."),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Table or breakout room cannot be blank."),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Explanation cannot be blank."),
    ).toBeInTheDocument();

    expect(mockSubmitAction).not.toHaveBeenCalled();
  });

  test("submits valid HelpRequest data", async () => {
    const mockSubmitAction = vi.fn();

    renderForm({ submitAction: mockSubmitAction });

    fillValidFields();

    fireEvent.click(screen.getByTestId(`${testId}-solved`));

    submitForm();

    await waitFor(() => {
      expect(mockSubmitAction).toHaveBeenCalledWith(
        expect.objectContaining({
          requesterEmail: "ckohlbrecher@ucsb.edu",
          teamId: "f26-03",
          tableOrBreakoutRoom: "table_03",
          explanation: "Need help with Java",
          solved: true,
        }),
        expect.anything(),
      );
    });
  });

  test("submits updated HelpRequest data", async () => {
    const mockSubmitAction = vi.fn();

    renderForm({
      initialContents: helpRequestFixtures.oneHelpRequest,
      submitAction: mockSubmitAction,
      buttonLabel: "Update",
    });

    fireEvent.change(screen.getByTestId(`${testId}-explanation`), {
      target: { value: "Updated explanation" },
    });

    submitForm();

    await waitFor(() => {
      expect(mockSubmitAction).toHaveBeenCalledWith(
        expect.objectContaining({
          explanation: "Updated explanation",
          requesterEmail: "ckohlbrecher@ucsb.edu",
        }),
        expect.anything(),
      );
    });
  });

  test("navigates back when Cancel is clicked", async () => {
    mockedNavigate.mockClear();

    renderForm();

    fireEvent.click(screen.getByTestId(`${testId}-cancel`));

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith(-1);
    });
  });

  test("rejects an email with text before the address", async () => {
    const mockSubmitAction = vi.fn();

    renderForm({ submitAction: mockSubmitAction });

    fillValidFields();

    fireEvent.change(screen.getByTestId(`${testId}-requesterEmail`), {
      target: { value: "invalid prefix@example.com" },
    });

    submitForm();

    expect(
      await screen.findByText("Please enter a valid email address."),
    ).toBeInTheDocument();

    expect(mockSubmitAction).not.toHaveBeenCalled();
  });

  test("rejects an email with text after the address", async () => {
    const mockSubmitAction = vi.fn();

    renderForm({ submitAction: mockSubmitAction });

    fillValidFields();

    fireEvent.change(screen.getByTestId(`${testId}-requesterEmail`), {
      target: { value: "valid@example.com extra" },
    });

    submitForm();

    expect(
      await screen.findByText("Please enter a valid email address."),
    ).toBeInTheDocument();

    expect(mockSubmitAction).not.toHaveBeenCalled();
  });
});
