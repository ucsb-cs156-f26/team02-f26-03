import OurTable, { ButtonColumn } from "main/components/OurTable";
import { useBackendMutation } from "main/utils/useBackend";
import { useNavigate } from "react-router";
import { hasRole } from "main/utils/useCurrentUser";
import { toast } from "react-toastify";

export default function UCSBDiningCommonsMenuItemTable({
  menuItems,
  currentUser,
  testIdPrefix = "UCSBDiningCommonsMenuItemTable",
}) {
  const navigate = useNavigate();

  const editCallback = (cell) => {
    navigate(`/diningcommonsmenuitem/edit/${cell.row.original.id}`);
  };

  const deleteMutation = useBackendMutation(
    (cell) => ({
      url: "/api/UCSBDiningCommonsMenuItem",
      method: "DELETE",
      params: {
        id: cell.row.original.id,
      },
    }),
    {
      onSuccess: () => toast.success("Menu item deleted"),
    },
    ["/api/UCSBDiningCommonsMenuItem/all"],
  );

  const deleteCallback = (cell) => {
    deleteMutation.mutate(cell);
  };

  const columns = [
    {
      header: "ID",
      accessorKey: "id",
    },
    {
      header: "Dining Commons Code",
      accessorKey: "diningCommonsCode",
    },
    {
      header: "Name",
      accessorKey: "name",
    },
    {
      header: "Station",
      accessorKey: "station",
    },
  ];

  if (hasRole(currentUser, "ROLE_ADMIN")) {
    columns.push(ButtonColumn("Edit", "primary", editCallback, testIdPrefix));
    columns.push(
      ButtonColumn("Delete", "danger", deleteCallback, testIdPrefix),
    );
  }

  return <OurTable data={menuItems} columns={columns} testid={testIdPrefix} />;
}
