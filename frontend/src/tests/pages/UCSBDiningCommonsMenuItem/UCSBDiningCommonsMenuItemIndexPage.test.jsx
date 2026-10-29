import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";

import UCSBDiningCommonsMenuItemIndexPage from "main/pages/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemIndexPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { ucsbDiningCommonsMenuItemFixtures } from "fixtures/ucsbDiningCommonsMenuItemFixtures";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

describe("UCSBDiningCommonsMenuItemIndexPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  const apiUrl = "/api/UCSBDiningCommonsMenuItem/all";
  const deleteUrl = "/api/UCSBDiningCommonsMenuItem";
  const testId = "UCSBDiningCommonsMenuItemTable";

  const setupUser = (user) => {
    axiosMock.reset();
    axiosMock.resetHistory();

    axiosMock.onGet("/api/currentUser").reply(200, user);

    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  const renderPage = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBDiningCommonsMenuItemIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  test("renders an empty table for ordinary user", async () => {
    setupUser(apiCurrentUserFixtures.userOnly);
    axiosMock.onGet(apiUrl).reply(200, []);

    renderPage();

    expect(
      await screen.findByText("UCSBDiningCommonsMenuItems"),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(axiosMock.history.get.some((r) => r.url === apiUrl)).toBe(true);
    });

    expect(screen.getByTestId(testId)).toBeInTheDocument();

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-id`),
    ).not.toBeInTheDocument();

    expect(screen.queryByText("Create Menu Item")).not.toBeInTheDocument();
  });

  test("renders three items for ordinary user", async () => {
    setupUser(apiCurrentUserFixtures.userOnly);

    axiosMock
      .onGet(apiUrl)
      .reply(200, ucsbDiningCommonsMenuItemFixtures.threeMenuItems);

    renderPage();

    expect(await screen.findByText("Cheese Pizza")).toBeInTheDocument();
    expect(screen.getByText("Grilled Chicken")).toBeInTheDocument();
    expect(screen.getByText("Garden Salad")).toBeInTheDocument();

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      "1",
    );

    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
      "4",
    );

    expect(screen.getByTestId(`${testId}-cell-row-2-col-id`)).toHaveTextContent(
      "7",
    );

    expect(screen.queryByText("Create Menu Item")).not.toBeInTheDocument();

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Edit-button`),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Delete-button`),
    ).not.toBeInTheDocument();
  });

  test("renders Create, Edit and Delete for admin user", async () => {
    setupUser(apiCurrentUserFixtures.adminUser);

    axiosMock
      .onGet(apiUrl)
      .reply(200, ucsbDiningCommonsMenuItemFixtures.threeMenuItems);

    renderPage();

    expect(await screen.findByText("Cheese Pizza")).toBeInTheDocument();

    const createButton = screen.getByRole("button", {
      name: "Create Menu Item",
    });

    expect(createButton).toHaveAttribute(
      "href",
      "/diningcommonsmenuitem/create",
    );

    expect(createButton).toHaveAttribute("style", "float: right;");

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-Edit-button`),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-Delete-button`),
    ).toBeInTheDocument();
  });

  test("handles backend GET failure", async () => {
    setupUser(apiCurrentUserFixtures.userOnly);

    axiosMock.onGet(apiUrl).reply(500);

    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    try {
      renderPage();

      await waitFor(() => {
        expect(errorSpy).toHaveBeenCalledWith(
          `Error communicating with backend via GET on ${apiUrl}`,
          expect.anything(),
        );
      });

      expect(
        screen.queryByTestId(`${testId}-cell-row-0-col-id`),
      ).not.toBeInTheDocument();
    } finally {
      errorSpy.mockRestore();
    }
  });

  test("deletes an item and refreshes table data", async () => {
    setupUser(apiCurrentUserFixtures.adminUser);

    const items = ucsbDiningCommonsMenuItemFixtures.threeMenuItems;

    axiosMock.onGet(apiUrl).replyOnce(200, items);

    axiosMock.onGet(apiUrl).reply(200, items.slice(1));

    axiosMock.onDelete(deleteUrl).reply(200, { message: "Menu item deleted" });

    renderPage();

    expect(await screen.findByText("Cheese Pizza")).toBeInTheDocument();

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(axiosMock.history.delete.length).toBe(1);
    });

    expect(axiosMock.history.delete[0].url).toBe(deleteUrl);

    expect(axiosMock.history.delete[0].params).toEqual({ id: 1 });

    await waitFor(() => {
      expect(screen.queryByText("Cheese Pizza")).not.toBeInTheDocument();
    });

    expect(screen.getByText("Grilled Chicken")).toBeInTheDocument();
    expect(screen.getByText("Garden Salad")).toBeInTheDocument();
  });
});
