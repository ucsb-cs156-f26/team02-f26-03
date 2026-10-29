import { Button, Form, Row, Col } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

function HelpRequestForm({
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
    defaultValues: {
      solved: false,
      ...initialContents,
    },
  });
  // Stryker restore all

  const navigate = useNavigate();

  const testIdPrefix = "HelpRequestForm";

  return (
    <Form onSubmit={handleSubmit(submitAction)}>
      <Row>
        {initialContents && (
          <Col>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="id">Id</Form.Label>
              <Form.Control
                data-testid={`${testIdPrefix}-id`}
                id="id"
                type="text"
                {...register("id")}
                readOnly
              />
            </Form.Group>
          </Col>
        )}
      </Row>

      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="requesterEmail">Requester Email</Form.Label>
            <Form.Control
              data-testid={`${testIdPrefix}-requesterEmail`}
              id="requesterEmail"
              type="email"
              isInvalid={Boolean(errors.requesterEmail)}
              {...register("requesterEmail", {
                required: "Requester email is required.",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Please enter a valid email address.",
                },
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.requesterEmail?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="teamId">Team ID</Form.Label>
            <Form.Control
              data-testid={`${testIdPrefix}-teamId`}
              id="teamId"
              type="text"
              isInvalid={Boolean(errors.teamId)}
              {...register("teamId", {
                required: "Team ID is required.",
                validate: (value) =>
                  value.trim().length > 0 || "Team ID cannot be blank.",
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.teamId?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="tableOrBreakoutRoom">
              Table or Breakout Room
            </Form.Label>
            <Form.Control
              data-testid={`${testIdPrefix}-tableOrBreakoutRoom`}
              id="tableOrBreakoutRoom"
              type="text"
              isInvalid={Boolean(errors.tableOrBreakoutRoom)}
              {...register("tableOrBreakoutRoom", {
                required: "Table or breakout room is required.",
                validate: (value) =>
                  value.trim().length > 0 ||
                  "Table or breakout room cannot be blank.",
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.tableOrBreakoutRoom?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="requestTime">Request Time</Form.Label>
            <Form.Control
              data-testid={`${testIdPrefix}-requestTime`}
              id="requestTime"
              type="datetime-local"
              step="1"
              isInvalid={Boolean(errors.requestTime)}
              {...register("requestTime", {
                required: "Request time is required.",
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.requestTime?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="explanation">Explanation</Form.Label>
            <Form.Control
              data-testid={`${testIdPrefix}-explanation`}
              id="explanation"
              as="textarea"
              rows={3}
              isInvalid={Boolean(errors.explanation)}
              {...register("explanation", {
                required: "Explanation is required.",
                validate: (value) =>
                  value.trim().length > 0 || "Explanation cannot be blank.",
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.explanation?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Check
              data-testid={`${testIdPrefix}-solved`}
              id="solved"
              type="checkbox"
              label="Solved"
              {...register("solved")}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Button type="submit" data-testid={`${testIdPrefix}-submit`}>
            {buttonLabel}
          </Button>

          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            data-testid={`${testIdPrefix}-cancel`}
          >
            Cancel
          </Button>
        </Col>
      </Row>
    </Form>
  );
}

export default HelpRequestForm;
