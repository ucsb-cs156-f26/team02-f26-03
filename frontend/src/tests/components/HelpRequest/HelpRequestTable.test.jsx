import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import HelpRequestTable from "main/components/HelpRequest/HelpRequestTable";

import { helpRequestFixtures } from "fixtures/helpRequestFixtures";

import { currentUserFixtures } from "fixtures/currentUserFixtures";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { MemoryRouter } from "react-router";

import axios from "axios";

import AxiosMockAdapter from "axios-mock-adapter";

const mockedNavigate = vi.fn();

vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");

  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("HelpRequestTable tests", () => {
  const testId = "HelpRequestTable";

  const expectedHeaders = [
    "ID",
    "Requester Email",
    "Team ID",
    "Table or Breakout Room",
    "Request Time",
    "Explanation",
    "Solved",
  ];

  const expectedFields = [
    "id",
    "requesterEmail",
    "teamId",
    "tableOrBreakoutRoom",
    "requestTime",
    "explanation",
    "solved",
  ];

  const renderTable = (props = {}) => {
    const queryClient = new QueryClient();

    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestTable
            helpRequests={helpRequestFixtures.threeHelpRequests}
            currentUser={currentUserFixtures.userOnly}
            {...props}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders an empty table correctly", () => {
    renderTable({ helpRequests: [] });

    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      expect(
        screen.queryByTestId(`${testId}-cell-row-0-col-${field}`),
      ).not.toBeInTheDocument();
    });
  });

  test("renders all seven columns", () => {
    renderTable();

    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-${field}`),
      ).toBeInTheDocument();
    });
  });

  test("displays HelpRequest data correctly", () => {
    renderTable();

    const expectedValues = {
      id: "1",
      requesterEmail: "ckohlbrecher@ucsb.edu",
      teamId: "f26-03",
      tableOrBreakoutRoom: "table_03",
      requestTime: "2026-10-20T11:30:00",
      explanation: "Need help debugging a Java program",
      solved: "No",
    };

    Object.entries(expectedValues).forEach(([field, value]) => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-${field}`),
      ).toHaveTextContent(value);
    });
  });

  test("displays solved status as Yes and No", () => {
    renderTable();

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-solved`),
    ).toHaveTextContent("No");

    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-solved`),
    ).toHaveTextContent("Yes");

    expect(
      screen.getByTestId(`${testId}-cell-row-2-col-solved`),
    ).toHaveTextContent("No");
  });

  test("renders a single HelpRequest", () => {
    renderTable({
      helpRequests: [helpRequestFixtures.oneHelpRequest],
    });

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      "1",
    );

    expect(
      screen.queryByTestId(`${testId}-cell-row-1-col-id`),
    ).not.toBeInTheDocument();
  });

  test("supports a custom testIdPrefix", () => {
    renderTable({
      helpRequests: [helpRequestFixtures.oneHelpRequest],
      testIdPrefix: "CustomHelpRequestTable",
    });

    expect(
      screen.getByTestId(
        "CustomHelpRequestTable-cell-row-0-col-requesterEmail",
      ),
    ).toHaveTextContent("ckohlbrecher@ucsb.edu");
  });

  test("ordinary users cannot see Edit or Delete buttons", () => {
    renderTable({
      currentUser: currentUserFixtures.userOnly,
    });

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Edit-button`),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Delete-button`),
    ).not.toBeInTheDocument();
  });

  test("admin users can see Edit and Delete buttons", () => {
    renderTable({
      currentUser: currentUserFixtures.adminUser,
    });

    const editButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );

    expect(editButton).toBeInTheDocument();
    expect(editButton).toHaveClass("btn-primary");

    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toHaveClass("btn-danger");
  });

  test("Edit button navigates to the correct page", async () => {
    renderTable({
      currentUser: currentUserFixtures.adminUser,
    });

    fireEvent.click(screen.getByTestId(`${testId}-cell-row-0-col-Edit-button`));

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith("/helprequest/edit/1");
    });
  });

  test("Delete button calls the correct backend endpoint", async () => {
    const axiosMock = new AxiosMockAdapter(axios);

    axiosMock.onDelete("/api/HelpRequest").reply(200, "HelpRequest deleted");

    renderTable({
      currentUser: currentUserFixtures.adminUser,
    });

    fireEvent.click(
      screen.getByTestId(`${testId}-cell-row-0-col-Delete-button`),
    );

    await waitFor(() => {
      expect(axiosMock.history.delete.length).toBe(1);
    });

    expect(axiosMock.history.delete[0].url).toBe("/api/HelpRequest");

    expect(axiosMock.history.delete[0].params).toEqual({
      id: 1,
    });

    axiosMock.restore();
  });
});
