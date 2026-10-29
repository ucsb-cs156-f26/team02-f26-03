import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";

import MenuItemReviewForm from "main/components/MenuItemReviews/MenuItemReviewForm";
import { menuItemReviewFixtures } from "fixtures/menuItemReviewFixtures";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("MenuItemReviewForm tests", () => {
  const queryClient = new QueryClient();

  const expectedHeaders = [
    "Item Id",
    "Reviewer Email",
    "Stars",
    "Date Reviewed (iso format)",
    "Comments",
  ];
  const testId = "MenuItemReviewForm";

  test("renders correctly with no initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemReviewForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expect(screen.queryByTestId(`${testId}-id`)).not.toBeInTheDocument();
  });

  test("renders correctly when passing in initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemReviewForm
            initialContents={menuItemReviewFixtures.oneReview}
          />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expect(await screen.findByTestId(`${testId}-id`)).toBeInTheDocument();
    expect(screen.getByText(`Id`)).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-id`)).toHaveValue("1");
    expect(screen.getByTestId(`${testId}-reviewerEmail`)).toHaveValue(
      "cgaucho@ucsb.edu",
    );
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemReviewForm />
        </Router>
      </QueryClientProvider>,
    );
    expect(await screen.findByTestId(`${testId}-cancel`)).toBeInTheDocument();
    const cancelButton = screen.getByTestId(`${testId}-cancel`);

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("that the required validations are performed", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemReviewForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();
    const submitButton = screen.getByText(/Create/);
    fireEvent.click(submitButton);

    await screen.findByText(/Item Id is required/);
    expect(screen.getByText(/Reviewer Email is required/)).toBeInTheDocument();
    expect(screen.getByText(/Stars is required/)).toBeInTheDocument();
    expect(screen.getByText(/Date Reviewed is required/)).toBeInTheDocument();
    expect(screen.getByText(/Comments are required/)).toBeInTheDocument();
  });

  test("that the range and format validations are performed", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemReviewForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();
    const submitButton = screen.getByText(/Create/);
    const itemIdInput = screen.getByTestId(`${testId}-itemId`);
    const reviewerEmailInput = screen.getByTestId(`${testId}-reviewerEmail`);
    const starsInput = screen.getByTestId(`${testId}-stars`);

    fireEvent.change(itemIdInput, { target: { value: "0" } });
    fireEvent.change(reviewerEmailInput, { target: { value: "bad-email" } });
    fireEvent.change(starsInput, { target: { value: "6" } });
    fireEvent.click(submitButton);

    await screen.findByText(/Item Id must be a positive number/);
    expect(
      screen.getByText(/Reviewer Email must be a valid email address/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Stars must be between 0 and 5/),
    ).toBeInTheDocument();
  });

  test("that stars below 0 is rejected", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemReviewForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();
    const starsInput = screen.getByTestId(`${testId}-stars`);

    fireEvent.change(starsInput, { target: { value: "-1" } });
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    expect(
      await screen.findByText("Stars must be between 0 and 5."),
    ).toBeInTheDocument();
  });

  test("No error messages on good input", async () => {
    const mockSubmitAction = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemReviewForm submitAction={mockSubmitAction} />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    fireEvent.change(screen.getByTestId(`${testId}-itemId`), {
      target: { value: "27" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-reviewerEmail`), {
      target: { value: "cgaucho@ucsb.edu" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-stars`), {
      target: { value: "5" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-dateReviewed`), {
      target: { value: "2022-01-02T12:00" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-comments`), {
      target: { value: "best apple pie ever" },
    });
    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());

    expect(screen.queryByText(/is required/)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/must be a valid email address/),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Stars must be between 0 and 5/),
    ).not.toBeInTheDocument();
  });
});
