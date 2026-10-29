import BasicLayout from "main/layouts/BasicLayout/BasicLayout";

import { useParams, Navigate } from "react-router";

import HelpRequestForm from "main/components/HelpRequest/HelpRequestForm";

import { useBackend, useBackendMutation } from "main/utils/useBackend";

import { toast } from "react-toastify";

export default function HelpRequestEditPage({ storybook = false }) {
  const { id } = useParams();

  const {
    data: helpRequest,
    error: _error,
    status: _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    [`/api/HelpRequest?id=${id}`],
    {
      url: "/api/HelpRequest",
      params: {
        id,
      },
    },
  );

  const objectToAxiosPutParams = (helpRequest) => ({
    url: "/api/HelpRequest",
    method: "PUT",
    params: {
      id: helpRequest.id,
    },
    data: {
      requesterEmail: helpRequest.requesterEmail,
      teamId: helpRequest.teamId,
      tableOrBreakoutRoom: helpRequest.tableOrBreakoutRoom,
      requestTime: helpRequest.requestTime,
      explanation: helpRequest.explanation,
      solved: helpRequest.solved,
    },
  });

  const onSuccess = (helpRequest) => {
    toast(
      `HelpRequest Updated - id: ${helpRequest.id} requesterEmail: ${helpRequest.requesterEmail}`,
    );
  };

  const mutation = useBackendMutation(
    objectToAxiosPutParams,
    { onSuccess },
    // Stryker disable next-line all : hard to test query caching
    [`/api/HelpRequest?id=${id}`],
  );

  const { isSuccess } = mutation;

  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  if (isSuccess && !storybook) {
    return <Navigate to="/helprequest" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Edit HelpRequest</h1>

        {helpRequest && (
          <HelpRequestForm
            initialContents={helpRequest}
            submitAction={onSubmit}
            buttonLabel="Update"
          />
        )}
      </div>
    </BasicLayout>
  );
}
