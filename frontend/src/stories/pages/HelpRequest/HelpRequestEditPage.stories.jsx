import React from "react";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";

import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

import { helpRequestFixtures } from "fixtures/helpRequestFixtures";

import { http, HttpResponse } from "msw";

import HelpRequestEditPage from "main/pages/HelpRequest/HelpRequestEditPage";

export default {
  title: "pages/HelpRequest/HelpRequestEditPage",
  component: HelpRequestEditPage,
};

const Template = () => <HelpRequestEditPage storybook={true} />;

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

    http.get("/api/HelpRequest", () => {
      return HttpResponse.json(helpRequestFixtures.oneHelpRequest, {
        status: 200,
      });
    }),

    http.put("/api/HelpRequest", () => {
      return HttpResponse.json(helpRequestFixtures.oneHelpRequest, {
        status: 200,
      });
    }),
  ],
};
