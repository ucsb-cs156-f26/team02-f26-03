import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ArticlesCreatePage from "main/pages/Articles/ArticlesCreatePage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

describe("ArticlesCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    vi.clearAllMocks();
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  const article = {
    id: 3,
    title: "Gauchos Win Big",
    url: "https://dailynexus.com/gauchos-win-big",
    explanation: "UCSB wins the championship",
    email: "reporter@ucsb.edu",
    dateAdded: "2022-02-02T00:00",
  };

  const fillInAndSubmitForm = () => {
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: article.title },
    });
    fireEvent.change(screen.getByLabelText("Url"), {
      target: { value: article.url },
    });
    fireEvent.change(screen.getByLabelText("Explanation"), {
      target: { value: article.explanation },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: article.email },
    });
    fireEvent.change(screen.getByLabelText("Date Added (iso format)"), {
      target: { value: article.dateAdded },
    });
    fireEvent.click(screen.getByText("Create"));
  };

  const queryClient = new QueryClient();
  test("renders without crashing", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticlesCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Title")).toBeInTheDocument();
    });
    expect(screen.getByText("Create New Article")).toBeInTheDocument();
  });

  test("on submit, makes request to backend, and redirects to /articles", async () => {
    const queryClient = new QueryClient();

    axiosMock.onPost("/api/articles/post").reply(202, article);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticlesCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Title")).toBeInTheDocument();
    });

    fillInAndSubmitForm();

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      title: "Gauchos Win Big",
      url: "https://dailynexus.com/gauchos-win-big",
      explanation: "UCSB wins the championship",
      email: "reporter@ucsb.edu",
      dateAdded: "2022-02-02T00:00",
    });

    // assert - check that the toast was called with the expected message
    expect(mockToast).toBeCalledWith(
      "New article Created - id: 3 title: Gauchos Win Big",
    );
    expect(mockNavigate).toBeCalledWith({ to: "/articles" });
  });

  test("does not redirect after submit when storybook is true", async () => {
    const queryClient = new QueryClient();

    axiosMock.onPost("/api/articles/post").reply(202, article);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticlesCreatePage storybook={true} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Title")).toBeInTheDocument();
    });

    fillInAndSubmitForm();

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));
    await waitFor(() =>
      expect(mockToast).toBeCalledWith(
        "New article Created - id: 3 title: Gauchos Win Big",
      ),
    );

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(screen.getByText("Create New Article")).toBeInTheDocument();
  });
});
