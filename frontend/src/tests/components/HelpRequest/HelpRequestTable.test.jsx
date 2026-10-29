import { render, screen, within } from "@testing-library/react";

import HelpRequestTable from "main/components/HelpRequest/HelpRequestTable";

import { helpRequestFixtures } from "fixtures/helpRequestFixtures";

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

  test("renders an empty table correctly", () => {
    render(<HelpRequestTable helpRequests={[]} />);

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
    render(
      <HelpRequestTable helpRequests={helpRequestFixtures.threeHelpRequests} />,
    );

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
    render(
      <HelpRequestTable helpRequests={helpRequestFixtures.threeHelpRequests} />,
    );

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
    render(
      <HelpRequestTable helpRequests={helpRequestFixtures.threeHelpRequests} />,
    );

    const solvedCells = screen.getAllByTestId(
      new RegExp(`^${testId}-cell-row-\\d+-col-solved$`),
    );

    expect(solvedCells).toHaveLength(3);

    expect(solvedCells.map((cell) => cell.textContent)).toEqual([
      "No",
      "Yes",
      "No",
    ]);
  });

  test("renders a single HelpRequest", () => {
    render(
      <HelpRequestTable helpRequests={[helpRequestFixtures.oneHelpRequest]} />,
    );

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      "1",
    );

    expect(
      screen.queryByTestId(`${testId}-cell-row-1-col-id`),
    ).not.toBeInTheDocument();
  });

  test("supports a custom testIdPrefix", () => {
    render(
      <HelpRequestTable
        helpRequests={[helpRequestFixtures.oneHelpRequest]}
        testIdPrefix="CustomHelpRequestTable"
      />,
    );

    const cell = screen.getByTestId(
      "CustomHelpRequestTable-cell-row-0-col-requesterEmail",
    );

    expect(cell).toHaveTextContent("ckohlbrecher@ucsb.edu");
    expect(within(cell).queryByRole("button")).not.toBeInTheDocument();
  });
});
