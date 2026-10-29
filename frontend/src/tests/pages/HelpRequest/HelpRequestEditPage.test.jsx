import { fireEvent, render, waitFor, screen } from "@testing-library/react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { MemoryRouter } from "react-router";

import HelpRequestEditPage from "main/pages/HelpRequest/HelpRequestEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";

import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

import { helpRequestFixtures } from "fixtures/helpRequestFixtures";

import axios from "axios";

import AxiosMockAdapter from "axios-mock-adapter";

const mockToast = vi.fn();
const mockNavigate = vi.fn();
const mockBack = vi.fn();

vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();

  return {
    ...originalModule,
    toast: vi.fn((message) => mockToast(message)),
  };
});

vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();

  return {
    ...originalModule,
    useParams: () => ({ id: "1" }),
    useNavigate: () => mockBack,
    Navigate: vi.fn((props) => {
      mockNavigate(props);
      return null;
    }),
  };
});

describe("HelpRequestEditPage tests", () => {
  let axiosMock;

  const originalHelpRequest = helpRequestFixtures.oneHelpRequest;

  beforeEach(() => {
    vi.clearAllMocks();

    axiosMock = new AxiosMockAdapter(axios);

    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);

    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  afterEach(() => {
    axiosMock.restore();
  });

  const renderPage = (props = {}) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestEditPage {...props} />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  const setupGet = () => {
    axiosMock
      .onGet("/api/HelpRequest", { params: { id: "1" } })
      .reply(200, originalHelpRequest);
  };

  test("renders header when backend does not return a record", async () => {
    axiosMock.onGet("/api/HelpRequest", { params: { id: "1" } }).reply(404);

    renderPage();

    expect(await screen.findByText("Edit HelpRequest")).toBeInTheDocument();

    expect(screen.queryByTestId("HelpRequestForm-id")).not.toBeInTheDocument();
  });

  test("populates the form with existing HelpRequest data", async () => {
    setupGet();

    renderPage();

    expect(await screen.findByTestId("HelpRequestForm-id")).toHaveValue("1");

    expect(screen.getByTestId("HelpRequestForm-id")).toHaveAttribute(
      "readonly",
    );

    expect(screen.getByTestId("HelpRequestForm-requesterEmail")).toHaveValue(
      "ckohlbrecher@ucsb.edu",
    );

    expect(screen.getByTestId("HelpRequestForm-teamId")).toHaveValue("f26-03");

    expect(
      screen.getByTestId("HelpRequestForm-tableOrBreakoutRoom"),
    ).toHaveValue("table_03");

    expect(screen.getByTestId("HelpRequestForm-explanation")).toHaveValue(
      "Need help debugging a Java program",
    );

    expect(screen.getByTestId("HelpRequestForm-solved")).not.toBeChecked();

    expect(screen.getByTestId("HelpRequestForm-submit")).toHaveTextContent(
      "Update",
    );
  });

  test("valid updates send PUT request and redirect", async () => {
    setupGet();

    axiosMock.onPut("/api/HelpRequest").reply(200, {
      ...originalHelpRequest,
      explanation: "Issue resolved successfully",
      solved: true,
    });

    renderPage();

    await screen.findByTestId("HelpRequestForm-id");

    fireEvent.change(screen.getByTestId("HelpRequestForm-explanation"), {
      target: { value: "Issue resolved successfully" },
    });

    fireEvent.click(screen.getByTestId("HelpRequestForm-solved"));

    fireEvent.click(screen.getByTestId("HelpRequestForm-submit"));

    await waitFor(() => {
      expect(axiosMock.history.put.length).toBe(1);
    });

    expect(axiosMock.history.put[0].url).toBe("/api/HelpRequest");

    expect(axiosMock.history.put[0].params).toEqual({
      id: 1,
    });

    expect(JSON.parse(axiosMock.history.put[0].data)).toEqual({
      requesterEmail: "ckohlbrecher@ucsb.edu",
      teamId: "f26-03",
      tableOrBreakoutRoom: "table_03",
      requestTime: "2026-10-20T11:30:00",
      explanation: "Issue resolved successfully",
      solved: true,
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        "HelpRequest Updated - id: 1 requesterEmail: ckohlbrecher@ucsb.edu",
      );

      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/helprequest",
      });
    });
  });

  test("invalid changes do not send PUT request", async () => {
    setupGet();

    renderPage();

    await screen.findByTestId("HelpRequestForm-id");

    fireEvent.change(screen.getByTestId("HelpRequestForm-teamId"), {
      target: { value: "   " },
    });

    fireEvent.click(screen.getByTestId("HelpRequestForm-submit"));

    expect(
      await screen.findByText("Team ID cannot be blank."),
    ).toBeInTheDocument();

    expect(axiosMock.history.put.length).toBe(0);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("Cancel navigates back without saving changes", async () => {
    setupGet();

    renderPage();

    await screen.findByTestId("HelpRequestForm-id");

    fireEvent.change(screen.getByTestId("HelpRequestForm-explanation"), {
      target: { value: "Unsaved changes" },
    });

    fireEvent.click(screen.getByTestId("HelpRequestForm-cancel"));

    expect(mockBack).toHaveBeenCalledWith(-1);
    expect(axiosMock.history.put.length).toBe(0);
  });

  test("storybook mode stays on the page after a successful update", async () => {
    setupGet();

    axiosMock.onPut("/api/HelpRequest").reply(200, originalHelpRequest);

    renderPage({ storybook: true });

    await screen.findByTestId("HelpRequestForm-id");

    fireEvent.click(screen.getByTestId("HelpRequestForm-submit"));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalled();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(screen.getByText("Edit HelpRequest")).toBeInTheDocument();
  });
});
