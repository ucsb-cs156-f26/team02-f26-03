import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, test, vi } from "vitest";

import UCSBDiningCommonsMenuItemForm from "main/components/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemForm";
import { ucsbDiningCommonsMenuItemFixtures } from "fixtures/ucsbDiningCommonsMenuItemFixtures";

const mockedNavigate = vi.fn();

vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

const prefix = "UCSBDiningCommonsMenuItemForm";

const renderForm = (props = {}) => {
  return render(
    <MemoryRouter>
      <UCSBDiningCommonsMenuItemForm {...props} />
    </MemoryRouter>,
  );
};

const fillValidFields = () => {
  fireEvent.change(screen.getByTestId(`${prefix}-diningCommonsCode`), {
    target: { value: "ortega" },
  });
  fireEvent.change(screen.getByTestId(`${prefix}-name`), {
    target: { value: "Pizza" },
  });
  fireEvent.change(screen.getByTestId(`${prefix}-station`), {
    target: { value: "Entrees" },
  });
};

describe("UCSBDiningCommonsMenuItemForm tests", () => {
  beforeEach(() => {
    mockedNavigate.mockClear();
  });

  test("renders correctly in Create mode", () => {
    renderForm();

    expect(screen.getByLabelText("Dining Commons Code")).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Station")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Create" })).toBeInTheDocument();
    expect(screen.queryByTestId(`${prefix}-id`)).not.toBeInTheDocument();

    expect(screen.getByLabelText("Name")).toHaveValue("");
    expect(screen.getByTestId(`${prefix}-submit`)).toHaveTextContent("Create");

    expect(screen.getByTestId(`${prefix}-cancel`)).toHaveTextContent("Cancel");
  });

  test("renders correctly in Update mode", () => {
    renderForm({
      initialContents: ucsbDiningCommonsMenuItemFixtures.oneMenuItem,
      buttonLabel: "Update",
    });

    const idInput = screen.getByTestId(`${prefix}-id`);

    expect(idInput).toHaveValue("1");
    expect(idInput).toHaveAttribute("readonly");

    expect(screen.getByLabelText("Dining Commons Code")).toHaveValue("ortega");
    expect(screen.getByLabelText("Name")).toHaveValue("Cheese Pizza");
    expect(screen.getByLabelText("Station")).toHaveValue("Entrees");
    expect(screen.getByRole("button", { name: "Update" })).toBeInTheDocument();
  });

  test("shows required errors for empty fields", async () => {
    const submitAction = vi.fn();
    renderForm({ submitAction });

    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    expect(await screen.findByText("Name is required.")).toBeInTheDocument();
    expect(screen.getByText("Station is required.")).toBeInTheDocument();
    expect(
      screen.getByText("Dining Commons Code is required."),
    ).toBeInTheDocument();

    expect(screen.getByLabelText("Name")).toHaveClass("is-invalid");
    expect(submitAction).not.toHaveBeenCalled();
  });

  test("rejects whitespace-only inputs", async () => {
    const submitAction = vi.fn();
    renderForm({ submitAction });

    for (const field of ["diningCommonsCode", "name", "station"]) {
      fireEvent.change(screen.getByTestId(`${prefix}-${field}`), {
        target: { value: "   " },
      });
    }

    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    expect(
      await screen.findByText("Name cannot be blank."),
    ).toBeInTheDocument();
    expect(screen.getByText("Station cannot be blank.")).toBeInTheDocument();
    expect(
      screen.getByText("Dining Commons Code cannot be blank."),
    ).toBeInTheDocument();

    expect(submitAction).not.toHaveBeenCalled();
  });

  test.each(["diningCommonsCode", "name", "station"])(
    "rejects %s longer than 255 characters",
    async (field) => {
      const submitAction = vi.fn();
      renderForm({ submitAction });

      fillValidFields();

      fireEvent.change(screen.getByTestId(`${prefix}-${field}`), {
        target: { value: "a".repeat(256) },
      });

      fireEvent.click(screen.getByRole("button", { name: "Create" }));

      expect(
        await screen.findByText("Max length 255 characters"),
      ).toBeInTheDocument();

      expect(submitAction).not.toHaveBeenCalled();
    },
  );

  test("submits valid data in Create mode", async () => {
    const submitAction = vi.fn();
    renderForm({ submitAction });

    fillValidFields();
    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(submitAction).toHaveBeenCalledTimes(1);
    });

    expect(submitAction.mock.calls[0][0]).toEqual({
      diningCommonsCode: "ortega",
      name: "Pizza",
      station: "Entrees",
    });
  });

  test("submits updated data in Update mode", async () => {
    const submitAction = vi.fn();

    renderForm({
      initialContents: ucsbDiningCommonsMenuItemFixtures.oneMenuItem,
      submitAction,
      buttonLabel: "Update",
    });

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Updated Pizza" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Update" }));

    await waitFor(() => {
      expect(submitAction).toHaveBeenCalledTimes(1);
    });

    expect(submitAction.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        diningCommonsCode: "ortega",
        name: "Updated Pizza",
        station: "Entrees",
      }),
    );
  });

  test("Cancel navigates back", () => {
    const submitAction = vi.fn();
    renderForm({ submitAction });

    const cancelButton = screen.getByTestId(`${prefix}-cancel`);

    expect(cancelButton).toHaveTextContent("Cancel");

    fireEvent.click(cancelButton);

    expect(mockedNavigate).toHaveBeenCalledWith(-1);
    expect(submitAction).not.toHaveBeenCalled();
  });
});
