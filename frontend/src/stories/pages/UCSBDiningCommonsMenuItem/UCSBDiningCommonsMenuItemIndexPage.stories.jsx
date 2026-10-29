import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { ucsbDiningCommonsMenuItemFixtures } from "fixtures/ucsbDiningCommonsMenuItemFixtures";
import { http, HttpResponse } from "msw";

import UCSBDiningCommonsMenuItemIndexPage from "main/pages/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemIndexPage";

export default {
  title: "pages/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemIndexPage",
  component: UCSBDiningCommonsMenuItemIndexPage,
};

const Template = () => <UCSBDiningCommonsMenuItemIndexPage />;

// Story 1: Empty table
export const Empty = Template.bind({});

Empty.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.userOnly);
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither);
    }),
    http.get("/api/UCSBDiningCommonsMenuItem/all", () => {
      return HttpResponse.json([]);
    }),
  ],
};

// Story 2: Ordinary user with three items
export const ThreeItemsOrdinaryUser = Template.bind({});

ThreeItemsOrdinaryUser.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.userOnly);
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither);
    }),
    http.get("/api/UCSBDiningCommonsMenuItem/all", () => {
      return HttpResponse.json(
        ucsbDiningCommonsMenuItemFixtures.threeMenuItems,
      );
    }),
  ],
};

// Story 3: Admin user with three items
export const ThreeItemsAdminUser = Template.bind({});

ThreeItemsAdminUser.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.adminUser);
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither);
    }),
    http.get("/api/UCSBDiningCommonsMenuItem/all", () => {
      return HttpResponse.json(
        ucsbDiningCommonsMenuItemFixtures.threeMenuItems,
      );
    }),
    http.delete("/api/UCSBDiningCommonsMenuItem", () => {
      return HttpResponse.json(
        { message: "Menu item deleted" },
        { status: 200 },
      );
    }),
  ],
};
