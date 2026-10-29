import React from "react";

import OurTable from "main/components/OurTable";

export default function HelpRequestTable({
  helpRequests,
  testIdPrefix = "HelpRequestTable",
}) {
  const columns = [
    {
      header: "ID",
      accessorKey: "id",
    },
    {
      header: "Requester Email",
      accessorKey: "requesterEmail",
    },
    {
      header: "Team ID",
      accessorKey: "teamId",
    },
    {
      header: "Table or Breakout Room",
      accessorKey: "tableOrBreakoutRoom",
    },
    {
      header: "Request Time",
      accessorKey: "requestTime",
    },
    {
      header: "Explanation",
      accessorKey: "explanation",
    },
    {
      header: "Solved",
      accessorKey: "solved",
      cell: ({ getValue }) => (getValue() ? "Yes" : "No"),
    },
  ];

  return (
    <OurTable data={helpRequests} columns={columns} testid={testIdPrefix} />
  );
}
