
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { toast } from "react-toastify";
import { beforeEach, afterEach, describe, expect, test, vi } from "vitest";

import UCSBDiningCommonsMenuItemTable from "main/components/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemTable";

import { ucsbDiningCommonsMenuItemFixtures } from "fixtures/ucsbDiningCommonsMenuItemFixtures";
import { currentUserFixtures } from "fixtures/currentUserFixtures";

const mockedNavigate = vi.fn();

vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");

  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

const testId = "UCSBDiningCommonsMenuItemTable";

const menuItems = ucsbDiningCommonsMenuItemFixtures.threeMenuItems;

let axiosMock;

beforeEach(() => {
  mockedNavigate.mockClear();
  axiosMock = new AxiosMockAdapter(axios);
});

afterEach(() => {
  axiosMock.restore();
  vi.restoreAllMocks();
});

function renderTable(items, currentUser, extraProps = {}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <UCSBDiningCommonsMenuItemTable
          menuItems={items}
          currentUser={currentUser}
          {...extraProps}
        />
      </MemoryRouter>
    </QueryClientProvider>,
  );

  return queryClient;
}

describe("UCSBDiningCommonsMenuItemTable tests", () => {
  test("renders empty table correctly", () => {
    renderTable([], currentUserFixtures.userOnly);

    const headers = [
      "ID",
      "Dining Commons Code",
      "Name",
      "Station",
    ];

    headers.forEach((header) => {
      expect(screen.getByText(header)).toBeInTheDocument();
    });

    expect(
      screen.queryByTestId(`${testId}-row-0`),
    ).not.toBeInTheDocument();
  });

  test("shows all data without action buttons for ordinary user", () => {
    renderTable(menuItems, currentUserFixtures.userOnly);

    const expectedFields = [
      "id",
      "diningCommonsCode",
      "name",
      "station",
    ];

    menuItems.forEach((item, rowIndex) => {
      expectedFields.forEach((field) => {
        const cell = screen.getByTestId(
          `${testId}-cell-row-${rowIndex}-col-${field}`,
        );

        expect(cell).toHaveTextContent(String(item[field]));
      });
    });

    expect(
      screen.queryByRole("button", { name: "Edit" }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: "Delete" }),
    ).not.toBeInTheDocument();
  });

  test("shows Edit and Delete buttons for admin", () => {
    renderTable(menuItems, currentUserFixtures.adminUser);

    const editButtons = screen.getAllByRole("button", {
      name: "Edit",
    });

    const deleteButtons = screen.getAllByRole("button", {
      name: "Delete",
    });

    expect(editButtons).toHaveLength(3);
    expect(deleteButtons).toHaveLength(3);

    expect(editButtons[0]).toHaveClass("btn-primary");
    expect(deleteButtons[0]).toHaveClass("btn-danger");

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-id`),
    ).toHaveTextContent("1");
  });

  test("Edit button navigates to correct page", async () => {
    renderTable(menuItems, currentUserFixtures.adminUser);

    const editButton = screen.getByTestId(
      `${testId}-cell-row-1-col-Edit-button`,
    );

    fireEvent.click(editButton);

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith(
        "/diningcommonsmenuitem/edit/4",
      );
    });
  });

  test("Delete button sends correct request and updates cache", async () => {
    axiosMock
      .onDelete("/api/UCSBDiningCommonsMenuItem")
      .reply(200, { message: "Menu item deleted" });

    const toastSpy = vi.spyOn(toast, "success").mockImplementation(
      () => "test-toast",
    );

    const queryClient = renderTable(
      menuItems,
      currentUserFixtures.adminUser,
    );

    const invalidateSpy = vi.spyOn(
      queryClient,
      "invalidateQueries",
    );

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-2-col-Delete-button`,
    );

    fireEvent.click(deleteButton);

    // Verify the DELETE request
    await waitFor(() => {
      expect(axiosMock.history.delete).toHaveLength(1);
    });

    const request = axiosMock.history.delete[0];

    expect(request.url).toBe(
      "/api/UCSBDiningCommonsMenuItem",
    );

    expect(request.params).toEqual({
      id: 7,
    });

    // Verify the success callback and message
    await waitFor(() => {
      expect(toastSpy).toHaveBeenCalledWith(
        "Menu item deleted",
      );
    });

    // Verify cache invalidation uses the correct query key
    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["/api/UCSBDiningCommonsMenuItem/all"],
      });
    });
  });

  test("supports a custom testIdPrefix", () => {
    renderTable(menuItems, currentUserFixtures.userOnly, {
      testIdPrefix: "CustomMenuTable",
    });

    expect(
      screen.getByTestId("CustomMenuTable"),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("CustomMenuTable-cell-row-0-col-name"),
    ).toHaveTextContent("Cheese Pizza");
  });
});
