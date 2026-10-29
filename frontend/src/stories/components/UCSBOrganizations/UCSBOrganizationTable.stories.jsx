import React from "react";
import UCSBOrganizationTable from "main/components/UCSBOrganizations/UCSBOrganizationTable";
import { ucsbOrganizationFixtures } from "fixtures/ucsbOrganizationFixtures";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import { http, HttpResponse } from "msw";

export default {
  title: "components/UCSBOrganizations/UCSBOrganizationTable",
  component: UCSBOrganizationTable,
};

const Template = (args) => {
  return <UCSBOrganizationTable {...args} />;
};

export const Empty = Template.bind({});

Empty.args = {
  organizations: [],
  currentUser: currentUserFixtures.userOnly,
};

export const ThreeItemsOrdinaryUser = Template.bind({});

ThreeItemsOrdinaryUser.args = {
  organizations: ucsbOrganizationFixtures.threeOrganization,
  currentUser: currentUserFixtures.userOnly,
};

export const ThreeItemsAdminUser = Template.bind({});
ThreeItemsAdminUser.args = {
  organizations: ucsbOrganizationFixtures.threeOrganization,
  currentUser: currentUserFixtures.adminUser,
};

ThreeItemsAdminUser.parameters = {
  msw: [
    http.delete("/api/ucsbOrganizations", () => {
      return HttpResponse.json(
        { message: "Organization deleted successfully" },
        { status: 200 },
      );
    }),
  ],
};
