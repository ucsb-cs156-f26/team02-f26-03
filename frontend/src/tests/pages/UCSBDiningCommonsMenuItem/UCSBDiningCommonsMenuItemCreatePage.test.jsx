import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";

import UCSBDiningCommonsMenuItemCreatePage from "main/pages/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemCreatePage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

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
    useNavigate: vi.fn(() => mockGoBack),
    Navigate: vi.fn((props) => {
      mockNavigate(props);
      return null;
    }),
  };
});

describe("UCSBDiningCommonsMenuItemCreatePage tests", () => {
  const apiUrl = "/api/UCSBDiningCommonsMenuItem/post";
  const prefix = "UCSBDiningCommonsMenuItemForm";

  let axiosMock;

  beforeEach(() => {
    vi.clearAllMocks();

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

  const renderPage = (storybook) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    const page =
      storybook === undefined ? (
        <UCSBDiningCommonsMenuItemCreatePage />
      ) : (
        <UCSBDiningCommonsMenuItemCreatePage storybook={storybook} />
      );

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{page}</MemoryRouter>
      </QueryClientProvider>,
    );

    return queryClient;
  };

  const fillValidForm = () => {
    fireEvent.change(screen.getByTestId(`${prefix}-diningCommonsCode`), {
      target: { value: "ortega" },
    });

    fireEvent.change(screen.getByTestId(`${prefix}-name`), {
      target: { value: "Test Pizza" },
    });

    fireEvent.change(screen.getByTestId(`${prefix}-station`), {
      target: { value: "Entrees" },
    });
  };

  const createdItem = {
    id: 3,
    diningCommonsCode: "ortega",
    name: "Test Pizza",
    station: "Entrees",
  };

  test("renders Create Page correctly", async () => {
    renderPage();

    expect(await screen.findByText("Create New Menu Item")).toBeInTheDocument();

    expect(
      screen.getByTestId(`${prefix}-diningCommonsCode`),
    ).toBeInTheDocument();

    expect(screen.getByTestId(`${prefix}-name`)).toBeInTheDocument();

    expect(screen.getByTestId(`${prefix}-station`)).toBeInTheDocument();

    expect(screen.queryByTestId(`${prefix}-id`)).not.toBeInTheDocument();

    expect(screen.getByTestId(`${prefix}-submit`)).toHaveTextContent("Create");
  });

  test("submits valid data using POST and navigates to Index", async () => {
    axiosMock.onPost(apiUrl).reply(201, createdItem);

    const queryClient = renderPage();

    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    await screen.findByText("Create New Menu Item");

    fillValidForm();

    fireEvent.click(screen.getByTestId(`${prefix}-submit`));

    await waitFor(() => {
      expect(axiosMock.history.post).toHaveLength(1);
    });

    const request = axiosMock.history.post[0];

    expect(request.url).toBe(apiUrl);
    expect(request.method).toBe("post");

    expect(request.params).toEqual({
      diningCommonsCode: "ortega",
      name: "Test Pizza",
      station: "Entrees",
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        "New Menu Item Created - id: 3 name: Test Pizza",
      );
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/diningcommonsmenuitem",
      });
    });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["/api/UCSBDiningCommonsMenuItem/all"],
      });
    });
  });

  test("does not POST empty form data", async () => {
    renderPage();

    await screen.findByText("Create New Menu Item");

    fireEvent.click(screen.getByTestId(`${prefix}-submit`));

    expect(await screen.findByText("Name is required.")).toBeInTheDocument();

    expect(axiosMock.history.post).toHaveLength(0);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("does not POST whitespace-only name", async () => {
    renderPage();

    await screen.findByText("Create New Menu Item");

    fillValidForm();

    fireEvent.change(screen.getByTestId(`${prefix}-name`), {
      target: { value: "   " },
    });

    fireEvent.click(screen.getByTestId(`${prefix}-submit`));

    expect(
      await screen.findByText("Name cannot be blank."),
    ).toBeInTheDocument();

    expect(axiosMock.history.post).toHaveLength(0);
  });

  test("Cancel navigates back without creating an item", async () => {
    renderPage();

    await screen.findByText("Create New Menu Item");

    fillValidForm();

    fireEvent.click(screen.getByTestId(`${prefix}-cancel`));

    expect(mockGoBack).toHaveBeenCalledWith(-1);
    expect(axiosMock.history.post).toHaveLength(0);
  });

  test("storybook mode does not navigate after successful POST", async () => {
    axiosMock.onPost(apiUrl).reply(200, createdItem);

    renderPage(true);

    await screen.findByText("Create New Menu Item");

    fillValidForm();

    fireEvent.click(screen.getByTestId(`${prefix}-submit`));

    await waitFor(() => {
      expect(axiosMock.history.post).toHaveLength(1);
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        "New Menu Item Created - id: 3 name: Test Pizza",
      );
    });

    expect(mockNavigate).not.toHaveBeenCalled();

    expect(screen.getByText("Create New Menu Item")).toBeInTheDocument();
  });

  test("explicit storybook false navigates after POST", async () => {
    axiosMock.onPost(apiUrl).reply(200, createdItem);

    renderPage(false);

    await screen.findByText("Create New Menu Item");

    fillValidForm();

    fireEvent.click(screen.getByTestId(`${prefix}-submit`));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/diningcommonsmenuitem",
      });
    });
  });
});
