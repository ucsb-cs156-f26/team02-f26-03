import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";

import UCSBDiningCommonsMenuItemEditPage from "main/pages/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { ucsbDiningCommonsMenuItemFixtures } from "fixtures/ucsbDiningCommonsMenuItemFixtures";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const { mockToast, mockNavigate, mockGoBack } = vi.hoisted(() => ({
  mockToast: vi.fn(),
  mockNavigate: vi.fn(),
  mockGoBack: vi.fn(),
}));

vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((message) => mockToast(message)),
  };
});

vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    useParams: vi.fn(() => ({ id: "1" })),
    useNavigate: vi.fn(() => mockGoBack),
    Navigate: vi.fn((props) => {
      mockNavigate(props);
      return null;
    }),
  };
});

describe("UCSBDiningCommonsMenuItemEditPage tests", () => {
  const apiUrl = "/api/UCSBDiningCommonsMenuItem";
  const prefix = "UCSBDiningCommonsMenuItemForm";

  let axiosMock;

  const originalItem = ucsbDiningCommonsMenuItemFixtures.oneMenuItem;

  const updatedItem = {
    ...originalItem,
    diningCommonsCode: "carrillo",
    name: "Cheese Pizza Updated",
    station: "Pizza Station",
  };

  beforeEach(() => {
    mockToast.mockClear();
    mockNavigate.mockClear();
    mockGoBack.mockClear();

    axiosMock = new AxiosMockAdapter(axios);

    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);

    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  afterEach(() => {
    axiosMock.restore();
    vi.restoreAllMocks();
  });

  // Allow the component's default storybook prop to be tested.
  const renderPage = (storybook) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    const page =
      storybook === undefined ? (
        <UCSBDiningCommonsMenuItemEditPage />
      ) : (
        <UCSBDiningCommonsMenuItemEditPage storybook={storybook} />
      );

    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{page}</MemoryRouter>
      </QueryClientProvider>,
    );
  };

  const setupGetAndPut = () => {
    axiosMock.onGet(apiUrl, { params: { id: "1" } }).reply(200, originalItem);

    axiosMock.onPut(apiUrl).reply(200, updatedItem);
  };

  test("loads existing menu item into the form", async () => {
    setupGetAndPut();

    renderPage();

    const nameField = await screen.findByTestId(`${prefix}-name`);

    expect(screen.getByText("Edit Menu Item")).toBeInTheDocument();

    expect(screen.getByTestId(`${prefix}-id`)).toHaveValue("1");

    expect(screen.getByTestId(`${prefix}-diningCommonsCode`)).toHaveValue(
      "ortega",
    );

    expect(nameField).toHaveValue("Cheese Pizza");

    expect(screen.getByTestId(`${prefix}-station`)).toHaveValue("Entrees");

    expect(screen.getByTestId(`${prefix}-submit`)).toHaveTextContent("Update");

    expect(
      axiosMock.history.get.some(
        (request) => request.url === apiUrl && request.params.id === "1",
      ),
    ).toBe(true);
  });

  test("does not render form when GET fails", async () => {
    axiosMock.onGet(apiUrl).reply(500);

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    renderPage();

    expect(await screen.findByText("Edit Menu Item")).toBeInTheDocument();

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        `Error communicating with backend via GET on ${apiUrl}`,
      );
    });

    expect(screen.queryByTestId(`${prefix}-name`)).not.toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  test("submits updated data using PUT and navigates back", async () => {
    setupGetAndPut();

    renderPage();

    const nameField = await screen.findByTestId(`${prefix}-name`);

    fireEvent.change(screen.getByTestId(`${prefix}-diningCommonsCode`), {
      target: { value: "carrillo" },
    });

    fireEvent.change(nameField, {
      target: { value: "Cheese Pizza Updated" },
    });

    fireEvent.change(screen.getByTestId(`${prefix}-station`), {
      target: { value: "Pizza Station" },
    });

    fireEvent.click(screen.getByTestId(`${prefix}-submit`));

    await waitFor(() => {
      expect(axiosMock.history.put.length).toBe(1);
    });

    const request = axiosMock.history.put[0];

    expect(request.url).toBe(apiUrl);
    expect(request.method).toBe("put");
    expect(Number(request.params.id)).toBe(1);

    expect(JSON.parse(request.data)).toEqual({
      diningCommonsCode: "carrillo",
      name: "Cheese Pizza Updated",
      station: "Pizza Station",
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        "Menu Item Updated - id: 1 name: Cheese Pizza Updated",
      );
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/diningcommonsmenuitem",
      });
    });
  });

  test("does not PUT invalid form data", async () => {
    setupGetAndPut();

    renderPage();

    const nameField = await screen.findByTestId(`${prefix}-name`);

    fireEvent.change(nameField, {
      target: { value: "" },
    });

    fireEvent.click(screen.getByTestId(`${prefix}-submit`));

    expect(await screen.findByText("Name is required.")).toBeInTheDocument();

    expect(axiosMock.history.put.length).toBe(0);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("Cancel goes back without saving", async () => {
    setupGetAndPut();

    renderPage();

    const nameField = await screen.findByTestId(`${prefix}-name`);

    fireEvent.change(nameField, {
      target: { value: "Unsaved Pizza" },
    });

    fireEvent.click(screen.getByTestId(`${prefix}-cancel`));

    expect(mockGoBack).toHaveBeenCalledWith(-1);
    expect(axiosMock.history.put.length).toBe(0);
  });

  test("storybook mode does not navigate after successful PUT", async () => {
    setupGetAndPut();

    renderPage(true);

    await screen.findByTestId(`${prefix}-name`);

    fireEvent.click(screen.getByTestId(`${prefix}-submit`));

    await waitFor(() => {
      expect(axiosMock.history.put.length).toBe(1);
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalled();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
