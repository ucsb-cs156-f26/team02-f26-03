import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import MenuItemReviewEditPage from "main/pages/MenuItemReview/MenuItemReviewEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "tests/testutils/mockConsole";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

const mockNavigate = vi.fn();
const mockUseNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    useParams: vi.fn(() => ({
      id: 17,
    })),
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
    useNavigate: () => mockUseNavigate,
  };
});

let axiosMock;
describe("MenuItemReviewEditPage tests", () => {
  describe("when the backend doesn't return data", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock.onGet("/api/menuitemreview", { params: { id: 17 } }).timeout();
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();
    test("renders header but form is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <MenuItemReviewEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText("Edit MenuItemReview");
      expect(
        screen.queryByTestId("MenuItemReviewForm-itemId"),
      ).not.toBeInTheDocument();
      restoreConsole();
    });
  });

  describe("tests where backend is working normally", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock
        .onGet("/api/menuitemreview", { params: { id: 17 } })
        .reply(200, {
          id: 17,
          itemId: 27,
          reviewerEmail: "cgaucho@ucsb.edu",
          stars: 3,
          dateReviewed: "2022-01-02T12:00",
          comments: "bland but edible I guess",
        });
      axiosMock.onPut("/api/menuitemreview").reply(200, {
        id: "17",
        itemId: "29",
        reviewerEmail: "ldelplaya@ucsb.edu",
        stars: "5",
        dateReviewed: "2022-04-03T12:00",
        comments: "best apple pie ever",
      });
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      mockUseNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();

    test("Is populated with the data provided", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <MenuItemReviewEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("MenuItemReviewForm-id");

      const idField = screen.getByTestId("MenuItemReviewForm-id");
      const itemIdField = screen.getByTestId("MenuItemReviewForm-itemId");
      const reviewerEmailField = screen.getByTestId(
        "MenuItemReviewForm-reviewerEmail",
      );
      const starsField = screen.getByTestId("MenuItemReviewForm-stars");
      const dateReviewedField = screen.getByTestId(
        "MenuItemReviewForm-dateReviewed",
      );
      const commentsField = screen.getByTestId("MenuItemReviewForm-comments");
      const submitButton = screen.getByTestId("MenuItemReviewForm-submit");

      expect(idField).toHaveValue("17");
      expect(itemIdField).toHaveValue(27);
      expect(reviewerEmailField).toHaveValue("cgaucho@ucsb.edu");
      expect(starsField).toHaveValue(3);
      expect(dateReviewedField).toHaveValue("2022-01-02T12:00");
      expect(commentsField).toHaveValue("bland but edible I guess");

      expect(submitButton).toHaveTextContent("Update");

      fireEvent.change(itemIdField, { target: { value: "29" } });
      fireEvent.change(reviewerEmailField, {
        target: { value: "ldelplaya@ucsb.edu" },
      });
      fireEvent.change(starsField, { target: { value: "5" } });
      fireEvent.change(dateReviewedField, {
        target: { value: "2022-04-03T12:00" },
      });
      fireEvent.change(commentsField, {
        target: { value: "best apple pie ever" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "MenuItemReview Updated - id: 17 itemId: 29",
      );

      expect(mockNavigate).toBeCalledWith({ to: "/menuitemreview" });

      expect(axiosMock.history.put.length).toBe(1); // times called
      expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          itemId: "29",
          reviewerEmail: "ldelplaya@ucsb.edu",
          stars: "5",
          dateReviewed: "2022-04-03T12:00",
          comments: "best apple pie ever",
        }),
      ); // posted object
    });

    test("Does not save when data is invalid", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <MenuItemReviewEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("MenuItemReviewForm-id");

      fireEvent.change(screen.getByTestId("MenuItemReviewForm-stars"), {
        target: { value: "6" },
      });
      fireEvent.click(screen.getByTestId("MenuItemReviewForm-submit"));

      await screen.findByText("Stars must be between 0 and 5.");
      expect(axiosMock.history.put.length).toBe(0);
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    test("Does not save and goes back when Cancel is clicked", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <MenuItemReviewEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("MenuItemReviewForm-id");

      fireEvent.change(screen.getByTestId("MenuItemReviewForm-comments"), {
        target: { value: "changed my mind" },
      });
      fireEvent.click(screen.getByTestId("MenuItemReviewForm-cancel"));

      await waitFor(() => expect(mockUseNavigate).toHaveBeenCalledWith(-1));
      expect(axiosMock.history.put.length).toBe(0);
    });
  });
});
