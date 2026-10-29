import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

function UCSBDiningCommonsMenuItemForm({
  initialContents,
  submitAction,
  buttonLabel = "Create",
}) {
  // Stryker disable all
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({
    defaultValues: initialContents || {},
  });
  // Stryker restore all

  const navigate = useNavigate();
  const testIdPrefix = "UCSBDiningCommonsMenuItemForm";

  return (
    <Form onSubmit={handleSubmit(submitAction)}>
      {initialContents && (
        <Form.Group className="mb-3">
          <Form.Label htmlFor="id">Id</Form.Label>
          <Form.Control
            data-testid={`${testIdPrefix}-id`}
            id="id"
            type="text"
            {...register("id")}
            value={initialContents.id}
            readOnly
          />
        </Form.Group>
      )}

      <Form.Group className="mb-3">
        <Form.Label htmlFor="diningCommonsCode">Dining Commons Code</Form.Label>
        <Form.Control
          data-testid={`${testIdPrefix}-diningCommonsCode`}
          id="diningCommonsCode"
          type="text"
          isInvalid={Boolean(errors.diningCommonsCode)}
          {...register("diningCommonsCode", {
            required: "Dining Commons Code is required.",
            validate: (value) =>
              value.trim().length > 0 || "Dining Commons Code cannot be blank.",
            maxLength: {
              value: 255,
              message: "Max length 255 characters",
            },
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.diningCommonsCode?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="name">Name</Form.Label>
        <Form.Control
          data-testid={`${testIdPrefix}-name`}
          id="name"
          type="text"
          isInvalid={Boolean(errors.name)}
          {...register("name", {
            required: "Name is required.",
            validate: (value) =>
              value.trim().length > 0 || "Name cannot be blank.",
            maxLength: {
              value: 255,
              message: "Max length 255 characters",
            },
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.name?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="station">Station</Form.Label>
        <Form.Control
          data-testid={`${testIdPrefix}-station`}
          id="station"
          type="text"
          isInvalid={Boolean(errors.station)}
          {...register("station", {
            required: "Station is required.",
            validate: (value) =>
              value.trim().length > 0 || "Station cannot be blank.",
            maxLength: {
              value: 255,
              message: "Max length 255 characters",
            },
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.station?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Button type="submit" data-testid={`${testIdPrefix}-submit`}>
        {buttonLabel}
      </Button>

      <Button
        type="button"
        variant="secondary"
        onClick={() => navigate(-1)}
        data-testid={`${testIdPrefix}-cancel`}
      >
        Cancel
      </Button>
    </Form>
  );
}

export default UCSBDiningCommonsMenuItemForm;
