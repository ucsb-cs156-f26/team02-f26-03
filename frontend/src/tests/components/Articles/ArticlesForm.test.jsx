import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import ArticleForm from "main/components/Articles/ArticleForm";
import { articlesFixtures } from "fixtures/articlesFixtures";
import { BrowserRouter as Router } from "react-router";
import { expect } from "vitest";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("ArticleForm tests", () => {
  test("renders correctly", async () => {
    render(
      <Router>
        <ArticleForm />
      </Router>,
    );
    await screen.findByText(/Title/);
    await screen.findByText(/Create/);
    expect(screen.getByText(/Title/)).toBeInTheDocument();
    expect(screen.getByText(/Email/)).toBeInTheDocument();
    expect(screen.getByText(/Url/)).toBeInTheDocument();
    expect(screen.getByText(/Explanation/)).toBeInTheDocument();
    expect(screen.getByText(/Date Added \(iso format\)/)).toBeInTheDocument();
    expect(screen.queryByTestId("ArticleForm-id")).not.toBeInTheDocument();
  });

  test("renders correctly when passing in an Article", async () => {
    render(
      <Router>
        <ArticleForm
          initialContents={articlesFixtures.oneArticle}
          buttonLabel="Update"
        />
      </Router>,
    );
    await screen.findByTestId(/ArticleForm-id/);
    expect(screen.getByText(/Id/)).toBeInTheDocument();
    expect(screen.getByTestId(/ArticleForm-id/)).toHaveValue("2");
    expect(screen.getByTestId("ArticleForm-title")).toHaveValue("article2");
    expect(screen.getByTestId("ArticleForm-email")).toHaveValue("a2@b.com");
    expect(screen.getByTestId("ArticleForm-url")).toHaveValue("http://two.com");
    expect(screen.getByTestId("ArticleForm-explanation")).toHaveValue(
      "article2 explaination",
    );
    expect(screen.getByTestId("ArticleForm-dateAdded")).toHaveValue(
      "2000-01-01T00:00:01.000",
    );
    expect(screen.getByText(/Update/)).toBeInTheDocument();
  });

  test("Correct Error messsages on missing input", async () => {
    render(
      <Router>
        <ArticleForm />
      </Router>,
    );
    await screen.findByTestId("ArticleForm-submit");
    const submitButton = screen.getByTestId("ArticleForm-submit");

    fireEvent.click(submitButton);

    await screen.findByText(/Title is required./);
    expect(screen.getByText(/Email is required./)).toBeInTheDocument();
    expect(screen.getByText(/Url is required./)).toBeInTheDocument();
    expect(screen.getByText(/Explanation is required./)).toBeInTheDocument();
    expect(screen.getByText(/Date Added is required./)).toBeInTheDocument();
  });

  test("Correct Error messsages on bad input", async () => {
    render(
      <Router>
        <ArticleForm />
      </Router>,
    );
    await screen.findByTestId("ArticleForm-title");

    fireEvent.change(screen.getByTestId("ArticleForm-title"), {
      target: { value: "a".repeat(256) },
    });
    fireEvent.change(screen.getByTestId("ArticleForm-email"), {
      target: { value: "not-an-email" },
    });
    fireEvent.change(screen.getByTestId("ArticleForm-url"), {
      target: { value: "not-a-url" },
    });
    fireEvent.change(screen.getByTestId("ArticleForm-explanation"), {
      target: { value: "b".repeat(256) },
    });
    fireEvent.click(screen.getByTestId("ArticleForm-submit"));

    await screen.findByText(/Title must be at most 255 characters./);
    expect(
      screen.getByText(/Email must be a valid email address./),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Url must be a valid url starting with http:\/\/ or https:\/\/./,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Explanation must be at most 255 characters./),
    ).toBeInTheDocument();
  });

  test.each([
    ["missing @", "me.ucsb.edu"],
    ["missing domain dot", "me@ucsb"],
    ["contains whitespace", "me @ucsb.edu"],
    ["two @ signs", "me@@ucsb.edu"],
  ])("Email error pops up when email is %s", async (_desc, email) => {
    render(
      <Router>
        <ArticleForm />
      </Router>,
    );
    await screen.findByTestId("ArticleForm-email");

    fireEvent.change(screen.getByTestId("ArticleForm-email"), {
      target: { value: email },
    });
    fireEvent.click(screen.getByTestId("ArticleForm-submit"));

    await screen.findByText(/Email must be a valid email address./);
    expect(
      screen.getByText(/Email must be a valid email address./),
    ).toBeInTheDocument();
  });

  test.each([
    ["missing scheme", "ucsb.edu"],
    ["not http(s)", "ftp://ucsb.edu"],
    ["missing domain dot", "https://localhost"],
    ["contains whitespace", "https://uc sb.edu"],
  ])("Url error pops up when url is %s", async (_desc, url) => {
    render(
      <Router>
        <ArticleForm />
      </Router>,
    );
    await screen.findByTestId("ArticleForm-url");

    fireEvent.change(screen.getByTestId("ArticleForm-url"), {
      target: { value: url },
    });
    fireEvent.click(screen.getByTestId("ArticleForm-submit"));

    await screen.findByText(
      /Url must be a valid url starting with http:\/\/ or https:\/\/./,
    );
    expect(
      screen.getByText(
        /Url must be a valid url starting with http:\/\/ or https:\/\/./,
      ),
    ).toBeInTheDocument();
  });

  test("No Error messsages at the length limit and on edge-case urls", async () => {
    const mockSubmitAction = vi.fn();

    render(
      <Router>
        <ArticleForm submitAction={mockSubmitAction} />
      </Router>,
    );
    await screen.findByTestId("ArticleForm-title");

    fireEvent.change(screen.getByTestId("ArticleForm-title"), {
      target: { value: "a".repeat(255) },
    });
    fireEvent.change(screen.getByTestId("ArticleForm-email"), {
      target: { value: "first.last@cs.ucsb.edu" },
    });
    fireEvent.change(screen.getByTestId("ArticleForm-url"), {
      target: { value: "HTTP://google.com?q=two" },
    });
    fireEvent.change(screen.getByTestId("ArticleForm-explanation"), {
      target: { value: "b".repeat(255) },
    });
    fireEvent.change(screen.getByTestId("ArticleForm-dateAdded"), {
      target: { value: "2022-01-02T12:00" },
    });
    fireEvent.click(screen.getByTestId("ArticleForm-submit"));

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());

    expect(screen.queryByText(/must be at most/)).not.toBeInTheDocument();
    expect(screen.queryByText(/must be a valid/)).not.toBeInTheDocument();
  });

  test("No Error messsages on good input", async () => {
    const mockSubmitAction = vi.fn();

    render(
      <Router>
        <ArticleForm submitAction={mockSubmitAction} />
      </Router>,
    );
    await screen.findByTestId("ArticleForm-title");

    const titleField = screen.getByTestId("ArticleForm-title");
    const emailField = screen.getByTestId("ArticleForm-email");
    const urlField = screen.getByTestId("ArticleForm-url");
    const explanationField = screen.getByTestId("ArticleForm-explanation");
    const dateAddedField = screen.getByTestId("ArticleForm-dateAdded");
    const submitButton = screen.getByTestId("ArticleForm-submit");

    fireEvent.change(titleField, { target: { value: "My Article" } });
    fireEvent.change(emailField, { target: { value: "me@ucsb.edu" } });
    fireEvent.change(urlField, { target: { value: "https://ucsb.edu" } });
    fireEvent.change(explanationField, {
      target: { value: "an interesting read" },
    });
    fireEvent.change(dateAddedField, {
      target: { value: "2022-01-02T12:00" },
    });
    fireEvent.click(submitButton);

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());

    expect(screen.queryByText(/Title is required./)).not.toBeInTheDocument();
    expect(screen.queryByText(/Email is required./)).not.toBeInTheDocument();
    expect(screen.queryByText(/Url is required./)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Explanation is required./),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Date Added is required./),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/must be at most/)).not.toBeInTheDocument();
    expect(screen.queryByText(/must be a valid/)).not.toBeInTheDocument();
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <Router>
        <ArticleForm />
      </Router>,
    );
    await screen.findByTestId("ArticleForm-cancel");
    const cancelButton = screen.getByTestId("ArticleForm-cancel");

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });
});
