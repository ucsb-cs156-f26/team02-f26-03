import React from "react";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";

import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

import { http, HttpResponse } from "msw";

import HelpRequestCreatePage from "main/pages/HelpRequest/HelpRequestCreatePage";

export default {
  title: "pages/HelpRequest/HelpRequestCreatePage",
  component: HelpRequestCreatePage,
};

const Template = () => <HelpRequestCreatePage storybook={true} />;

export const Default = Template.bind({});

Default.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.adminUser, {
        status: 200,
      });
    }),

    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither, {
        status: 200,
      });
    }),

    http.post("/api/HelpRequest/post", () => {
      return HttpResponse.json(
        {
          id: 1,
          requesterEmail: "ckohlbrecher@ucsb.edu",
          teamId: "f26-03",
          tableOrBreakoutRoom: "table_03",
          requestTime: "2026-10-20T11:30:00",
          explanation: "Need help debugging a Java program",
          solved: false,
        },
        { status: 200 },
      );
    }),
  ],
};
