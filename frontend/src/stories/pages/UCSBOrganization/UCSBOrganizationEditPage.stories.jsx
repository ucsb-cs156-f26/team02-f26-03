import React from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { http, HttpResponse } from "msw";

import UCSBOrganizationEditPage from "main/pages/UCSBOrganization/UCSBOrganizationEditPage";
import { ucsbOrganizationFixtures } from "fixtures/ucsbOrganizationFixtures";

export default {
  title: "pages/UCSBOrganization/UCSBOrganizationEditPage",
  component: UCSBOrganizationEditPage,
};

const Template = () => <UCSBOrganizationEditPage storybook={true} />;

export const Default = Template.bind({});
Default.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.userOnly, {
        status: 200,
      });
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither, {
        status: 200,
      });
    }),
    http.get("/api/ucsborganizations", () => {
      return HttpResponse.json(ucsbOrganizationFixtures.threeOrganization[0], {
        status: 200,
      });
    }),
    http.put("/api/ucsborganizations", async () => {
      return HttpResponse.json({ orgCode: "ZPR" }, { status: 200 });
    }),
  ],
};
