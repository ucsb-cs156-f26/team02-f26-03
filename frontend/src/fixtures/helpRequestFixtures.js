const helpRequestFixtures = {
  oneHelpRequest: {
    id: 1,
    requesterEmail: "ckohlbrecher@ucsb.edu",
    teamId: "f26-03",
    tableOrBreakoutRoom: "table_03",
    requestTime: "2026-10-20T11:30:00",
    explanation: "Need help debugging a Java program",
    solved: false,
  },

  threeHelpRequests: [
    {
      id: 1,
      requesterEmail: "ckohlbrecher@ucsb.edu",
      teamId: "f26-03",
      tableOrBreakoutRoom: "table_03",
      requestTime: "2026-10-20T11:30:00",
      explanation: "Need help debugging a Java program",
      solved: false,
    },
    {
      id: 2,
      requesterEmail: "student2@ucsb.edu",
      teamId: "f26-04",
      tableOrBreakoutRoom: "table_05",
      requestTime: "2026-10-21T14:15:00",
      explanation: "Having trouble with Spring Boot controllers",
      solved: true,
    },
    {
      id: 3,
      requesterEmail: "student3@ucsb.edu",
      teamId: "f26-05",
      tableOrBreakoutRoom: "table_07",
      requestTime: "2026-10-22T10:45:00",
      explanation: "Need assistance writing unit tests",
      solved: false,
    },
  ],
};

export { helpRequestFixtures };
