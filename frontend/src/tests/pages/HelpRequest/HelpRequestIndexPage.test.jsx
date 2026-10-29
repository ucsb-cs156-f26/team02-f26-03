import { render, screen, waitFor, fireEvent } from "@testing-library/react";

import HelpRequestIndexPage from "main/pages/HelpRequest/HelpRequestIndexPage";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { MemoryRouter } from "react-router";

import { helpRequestFixtures } from "fixtures/helpRequestFixtures";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";

import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

import axios from "axios";

import AxiosMockAdapter from "axios-mock-adapter";

const mockToast = vi.fn();

vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();

  return {
    ...originalModule,
    toast: vi.fn((message) => mockToast(message)),
  };
});

describe("HelpRequestIndexPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const testId = "HelpRequestTable";

  beforeEach(() => {
    vi.clearAllMocks();
    axiosMock.reset();
    axiosMock.resetHistory();

    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  const setupUser = (admin = false) => {
    axiosMock
      .onGet("/api/currentUser")
      .reply(
        200,
        admin
          ? apiCurrentUserFixtures.adminUser
          : apiCurrentUserFixtures.userOnly,
      );
  };

  const renderPage = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  test("renders Create button for admin user", async () => {
    setupUser(true);

    axiosMock.onGet("/api/HelpRequest/all").reply(200, []);

    renderPage();

    const button = await screen.findByText("Create HelpRequest");

    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("href", "/helprequest/create");
    expect(button).toHaveAttribute("style", "float: right;");
  });

  test("renders HelpRequest records for ordinary user", async () => {
    setupUser(false);

    axiosMock
      .onGet("/api/HelpRequest/all")
      .reply(200, helpRequestFixtures.threeHelpRequests);

    renderPage();

    expect(
      await screen.findByTestId(`${testId}-cell-row-0-col-id`),
    ).toHaveTextContent("1");

    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
      "2",
    );

    expect(screen.getByTestId(`${testId}-cell-row-2-col-id`)).toHaveTextContent(
      "3",
    );

    expect(screen.getByText("HelpRequests")).toBeInTheDocument();

    expect(
      screen.getByText("Need help debugging a Java program"),
    ).toBeInTheDocument();

    expect(screen.queryByText("Create HelpRequest")).not.toBeInTheDocument();

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Edit-button`),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Delete-button`),
    ).not.toBeInTheDocument();
  });

  test("renders an empty table when backend returns no records", async () => {
    setupUser(false);

    axiosMock.onGet("/api/HelpRequest/all").reply(200, []);

    renderPage();

    await waitFor(() => {
      expect(
        axiosMock.history.get.some(
          (request) => request.url === "/api/HelpRequest/all",
        ),
      ).toBe(true);
    });

    expect(screen.getByText("HelpRequests")).toBeInTheDocument();

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-id`),
    ).not.toBeInTheDocument();
  });

  test("admin user can see Edit and Delete buttons", async () => {
    setupUser(true);

    axiosMock
      .onGet("/api/HelpRequest/all")
      .reply(200, helpRequestFixtures.threeHelpRequests);

    renderPage();

    expect(
      await screen.findByTestId(`${testId}-cell-row-0-col-id`),
    ).toHaveTextContent("1");

    expect(screen.getByText("Create HelpRequest")).toBeInTheDocument();

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-Edit-button`),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-Delete-button`),
    ).toBeInTheDocument();
  });

  test("admin can delete a HelpRequest", async () => {
    setupUser(true);

    axiosMock
      .onGet("/api/HelpRequest/all")
      .reply(200, helpRequestFixtures.threeHelpRequests);

    axiosMock
      .onDelete("/api/HelpRequest")
      .reply(200, "HelpRequest with id 1 was deleted");

    renderPage();

    const deleteButton = await screen.findByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(axiosMock.history.delete.length).toBe(1);
    });

    expect(axiosMock.history.delete[0].url).toBe("/api/HelpRequest");

    expect(axiosMock.history.delete[0].params).toEqual({
      id: 1,
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        "HelpRequest with id 1 was deleted",
      );
    });
  });
});
