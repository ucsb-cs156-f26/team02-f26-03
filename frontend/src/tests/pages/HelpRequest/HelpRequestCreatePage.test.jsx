import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import HelpRequestCreatePage from "main/pages/HelpRequest/HelpRequestCreatePage";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { MemoryRouter } from "react-router";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";

import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

import axios from "axios";

import AxiosMockAdapter from "axios-mock-adapter";

const mockToast = vi.fn();

vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();

  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

const mockNavigate = vi.fn();

vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();

  return {
    ...originalModule,
    Navigate: vi.fn((props) => {
      mockNavigate(props);
      return null;
    }),
  };
});

describe("HelpRequestCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    vi.clearAllMocks();

    axiosMock.reset();
    axiosMock.resetHistory();

    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);

    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  const renderPage = (props = {}) => {
    const queryClient = new QueryClient();

    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestCreatePage {...props} />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  const fillValidForm = () => {
    fireEvent.change(screen.getByLabelText("Requester Email"), {
      target: { value: "ckohlbrecher@ucsb.edu" },
    });

    fireEvent.change(screen.getByLabelText("Team ID"), {
      target: { value: "f26-03" },
    });

    fireEvent.change(screen.getByLabelText("Table or Breakout Room"), {
      target: { value: "table_03" },
    });

    fireEvent.change(screen.getByLabelText("Request Time"), {
      target: { value: "2026-10-20T11:30:00" },
    });

    fireEvent.change(screen.getByLabelText("Explanation"), {
      target: { value: "Need help debugging a Java program" },
    });
  };

  test("renders the HelpRequest form", async () => {
    renderPage();

    expect(
      await screen.findByText("Create New HelpRequest"),
    ).toBeInTheDocument();

    expect(screen.getByLabelText("Requester Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Team ID")).toBeInTheDocument();
    expect(screen.getByLabelText("Table or Breakout Room")).toBeInTheDocument();
    expect(screen.getByLabelText("Request Time")).toBeInTheDocument();
    expect(screen.getByLabelText("Explanation")).toBeInTheDocument();
    expect(screen.getByLabelText("Solved")).toBeInTheDocument();

    expect(screen.getByTestId("HelpRequestForm-submit")).toHaveTextContent(
      "Create",
    );
  });

  test("submitting valid data sends POST request and redirects", async () => {
    const helpRequest = {
      id: 1,
      requesterEmail: "ckohlbrecher@ucsb.edu",
      teamId: "f26-03",
      tableOrBreakoutRoom: "table_03",
      requestTime: "2026-10-20T11:30:00",
      explanation: "Need help debugging a Java program",
      solved: false,
    };

    axiosMock.onPost("/api/HelpRequest/post").reply(200, helpRequest);

    renderPage();

    await screen.findByLabelText("Requester Email");

    fillValidForm();

    fireEvent.click(screen.getByTestId("HelpRequestForm-submit"));

    await waitFor(() => {
      expect(axiosMock.history.post.length).toBe(1);
    });

    expect(axiosMock.history.post[0].params).toEqual({
      requesterEmail: "ckohlbrecher@ucsb.edu",
      teamId: "f26-03",
      tableOrBreakoutRoom: "table_03",
      requestTime: "2026-10-20T11:30",
      explanation: "Need help debugging a Java program",
      solved: false,
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        "New HelpRequest Created - id: 1 requesterEmail: ckohlbrecher@ucsb.edu",
      );

      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/helprequest",
      });
    });
  });

  test("invalid form data does not send a POST request", async () => {
    renderPage();

    await screen.findByLabelText("Requester Email");

    fireEvent.click(screen.getByTestId("HelpRequestForm-submit"));

    expect(
      await screen.findByText("Requester email is required."),
    ).toBeInTheDocument();

    expect(screen.getByText("Team ID is required.")).toBeInTheDocument();

    expect(
      screen.getByText("Table or breakout room is required."),
    ).toBeInTheDocument();

    expect(screen.getByText("Request time is required.")).toBeInTheDocument();

    expect(screen.getByText("Explanation is required.")).toBeInTheDocument();

    expect(axiosMock.history.post.length).toBe(0);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("invalid email prevents submission", async () => {
    renderPage();

    await screen.findByLabelText("Requester Email");

    fillValidForm();

    fireEvent.change(screen.getByLabelText("Requester Email"), {
      target: { value: "invalid@example" },
    });

    fireEvent.click(screen.getByTestId("HelpRequestForm-submit"));

    expect(
      await screen.findByText("Please enter a valid email address."),
    ).toBeInTheDocument();

    expect(axiosMock.history.post.length).toBe(0);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("storybook mode does not redirect after successful submission", async () => {
    const helpRequest = {
      id: 2,
      requesterEmail: "ckohlbrecher@ucsb.edu",
      teamId: "f26-03",
      tableOrBreakoutRoom: "table_03",
      requestTime: "2026-10-20T11:30:00",
      explanation: "Need help debugging a Java program",
      solved: false,
    };

    axiosMock.onPost("/api/HelpRequest/post").reply(200, helpRequest);

    renderPage({ storybook: true });

    await screen.findByLabelText("Requester Email");

    fillValidForm();

    fireEvent.click(screen.getByTestId("HelpRequestForm-submit"));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalled();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(screen.getByText("Create New HelpRequest")).toBeInTheDocument();
  });
});
