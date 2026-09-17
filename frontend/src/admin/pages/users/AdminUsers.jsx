import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import {
  getAdminUsers,
  toggleAdminUserStatus,
} from "../../services/adminUserApi";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalUsers: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getAdminUsers({
        search,
        status,
        page: pagination.page,
        limit: pagination.limit,
        sort: "-createdAt",
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to fetch customers");
      }

      setUsers(response.data?.users || []);

      setPagination((prev) => ({
        ...prev,
        ...(response.data?.pagination || {}),
      }));
    } catch (error) {
      console.error("Admin users fetch error:", error);

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch customers",
      );
    } finally {
      setLoading(false);
    }
  }, [search, status, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearchChange = (event) => {
    setSearch(event.target.value);

    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  };

  const handleStatusChange = (event) => {
    setStatus(event.target.value);

    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  };

  const handleToggleStatus = async (userId) => {
    try {
      setActionLoading(userId);

      const response = await toggleAdminUserStatus(userId);

      if (!response.success) {
        throw new Error(response.message || "Failed to update customer status");
      }

      toast.success(response.message || "Customer status updated");

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user._id === userId
            ? {
                ...user,
                isActive: response.data?.isActive ?? !user.isActive,
              }
            : user,
        ),
      );
    } catch (error) {
      console.error("Toggle customer status error:", error);

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update customer status",
      );
    } finally {
      setActionLoading("");
    }
  };

  const handlePreviousPage = () => {
    if (!pagination.hasPrev) return;

    setPagination((prev) => ({
      ...prev,
      page: prev.page - 1,
    }));
  };

  const handleNextPage = () => {
    if (!pagination.hasNext) return;

    setPagination((prev) => ({
      ...prev,
      page: prev.page + 1,
    }));
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-neutral-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-500">
              Administration
            </p>

            <h1 className="mt-1 text-2xl font-bold text-neutral-900">
              Customers
            </h1>

            <p className="mt-1 text-sm text-neutral-500">
              Manage registered customers and account status.
            </p>
          </div>

          <div className="rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-neutral-200">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              Total Customers
            </p>

            <p className="mt-1 text-2xl font-bold text-neutral-900">
              {pagination.totalUsers}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-5 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-neutral-200">
          <div className="grid gap-4 md:grid-cols-[1fr_220px]">
            {/* Search */}
            <div>
              <label
                htmlFor="customer-search"
                className="mb-2 block text-sm font-medium text-neutral-700"
              >
                Search customers
              </label>

              <input
                id="customer-search"
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search by name, username, email or phone..."
                className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200"
              />
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="customer-status"
                className="mb-2 block text-sm font-medium text-neutral-700"
              >
                Status
              </label>

              <select
                id="customer-status"
                value={status}
                onChange={handleStatusChange}
                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200"
              >
                <option value="all">All Customers</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="border-b border-neutral-200 bg-neutral-50">
                <tr>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Customer
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Username
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Email
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Phone
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Joined
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-5 py-12 text-center text-sm text-neutral-500"
                    >
                      Loading customers...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-5 py-12 text-center">
                      <p className="text-sm font-medium text-neutral-700">
                        No customers found
                      </p>

                      <p className="mt-1 text-sm text-neutral-500">
                        Try changing your search or status filter.
                      </p>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user._id}
                      className="transition hover:bg-neutral-50"
                    >
                      {/* Customer */}
                      <td className="whitespace-nowrap px-5 py-4">
                        <div>
                          <p className="font-medium text-neutral-900">
                            {user.fullName || "Unnamed Customer"}
                          </p>

                          <p className="mt-0.5 text-xs text-neutral-500">
                            ID: {user._id}
                          </p>
                        </div>
                      </td>

                      {/* Username */}
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-neutral-700">
                        @{user.username || "-"}
                      </td>

                      {/* Email */}
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-neutral-700">
                        {user.email || "-"}
                      </td>

                      {/* Phone */}
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-neutral-700">
                        {user.phone || "-"}
                      </td>

                      {/* Status */}
                      <td className="whitespace-nowrap px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            user.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Joined */}
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-neutral-600">
                        {formatDate(user.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="whitespace-nowrap px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/users/${user._id}`}
                            className="rounded-lg border border-neutral-300 px-3 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-100"
                          >
                            View
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleToggleStatus(user._id)}
                            disabled={actionLoading === user._id}
                            className={`rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                              user.isActive
                                ? "bg-red-600 text-white hover:bg-red-700"
                                : "bg-neutral-900 text-white hover:bg-neutral-800"
                            }`}
                          >
                            {actionLoading === user._id
                              ? "Updating..."
                              : user.isActive
                                ? "Deactivate"
                                : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && users.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-neutral-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-neutral-500">
                Page{" "}
                <span className="font-medium text-neutral-700">
                  {pagination.page}
                </span>{" "}
                of{" "}
                <span className="font-medium text-neutral-700">
                  {pagination.totalPages || 1}
                </span>
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePreviousPage}
                  disabled={!pagination.hasPrev}
                  className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={!pagination.hasNext}
                  className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
