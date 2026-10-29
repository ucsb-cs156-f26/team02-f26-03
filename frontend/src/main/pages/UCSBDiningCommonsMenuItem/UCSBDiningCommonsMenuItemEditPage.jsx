import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useParams, Navigate } from "react-router";
import UCSBDiningCommonsMenuItemForm from "main/components/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemForm";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function UCSBDiningCommonsMenuItemEditPage({
  storybook = false,
}) {
  const { id } = useParams();

  const { data: menuItem } = useBackend(
    // Stryker disable next-line all : don't test React Query internal caching
    [`/api/UCSBDiningCommonsMenuItem?id=${id}`],
    {
      // Stryker disable next-line all : GET is the default
      method: "GET",
      url: "/api/UCSBDiningCommonsMenuItem",
      params: {
        id,
      },
    },
  );

  const objectToAxiosPutParams = (menuItem) => ({
    url: "/api/UCSBDiningCommonsMenuItem",
    method: "PUT",
    params: {
      id: menuItem.id,
    },
    data: {
      diningCommonsCode: menuItem.diningCommonsCode,
      name: menuItem.name,
      station: menuItem.station,
    },
  });

  const onSuccess = (updatedItem) => {
    toast(
      `Menu Item Updated - id: ${updatedItem.id} name: ${updatedItem.name}`,
    );
  };

  const mutation = useBackendMutation(
    objectToAxiosPutParams,
    { onSuccess },
    // Stryker disable next-line all : don't test React Query internal caching
    [`/api/UCSBDiningCommonsMenuItem?id=${id}`],
  );

  const { isSuccess } = mutation;

  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  if (isSuccess && !storybook) {
    return <Navigate to="/diningcommonsmenuitem" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Edit Menu Item</h1>

        {menuItem && (
          <UCSBDiningCommonsMenuItemForm
            initialContents={menuItem}
            submitAction={onSubmit}
            buttonLabel="Update"
          />
        )}
      </div>
    </BasicLayout>
  );
}
