import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import {
  getAdminUserById,
  toggleAdminUserStatus,
} from "../../services/adminUserApi";

const AdminUserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);

        const response = await getAdminUserById(id);

        if (!response.success) {
          throw new Error(response.message || "Failed to fetch customer");
        }

        setUser(response.data || null);
      } catch (error) {
        console.error("Admin user details error:", error);

        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Failed to fetch customer",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleToggleStatus = async () => {
    if (!user) return;

    try {
      setActionLoading(true);

      const response = await toggleAdminUserStatus(user._id);

      if (!response.success) {
        throw new Error(response.message || "Failed to update customer status");
      }

      setUser((currentUser) => ({
        ...currentUser,
        isActive: response.data?.isActive ?? !currentUser.isActive,
      }));

      toast.success(response.message || "Customer status updated");
    } catch (error) {
      console.error("Toggle customer status error:", error);

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update customer status",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-100">
        <p className="text-sm text-neutral-500">Loading customer...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-100 p-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-neutral-200">
          <h1 className="text-xl font-bold text-neutral-900">
            Customer not found
          </h1>

          <p className="mt-2 text-sm text-neutral-500">
            The requested customer could not be found.
          </p>

          <button
            type="button"
            onClick={() => navigate("/admin/users")}
            className="mt-6 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            Back to Customers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 p-4 md:p-6">
      <div className="mx-auto max-w-5xl">
        {/* Back */}
        <div className="mb-5">
          <Link
            to="/admin/users"
            className="inline-flex items-center text-sm font-medium text-neutral-600 transition hover:text-neutral-900"
          >
            ← Back to Customers
          </Link>
        </div>

        {/* Header */}
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-200">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xl font-bold text-white">
                {(user.fullName || user.username || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold text-neutral-900">
                    {user.fullName || "Unnamed Customer"}
                  </h1>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      user.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <p className="mt-1 text-sm text-neutral-500">
                  @{user.username || "-"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleStatus}
              disabled={actionLoading}
              className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
                user.isActive
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-neutral-900 hover:bg-neutral-800"
              }`}
            >
              {actionLoading
                ? "Updating..."
                : user.isActive
                  ? "Deactivate Customer"
                  : "Activate Customer"}
            </button>
          </div>
        </div>

        {/* Account Information */}
        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-200">
            <h2 className="text-lg font-bold text-neutral-900">
              Account Information
            </h2>

            <div className="mt-5 space-y-4">
              <InfoRow label="Full Name" value={user.fullName} />

              <InfoRow
                label="Username"
                value={user.username ? `@${user.username}` : "-"}
              />

              <InfoRow label="Email" value={user.email} />

              <InfoRow label="Phone" value={user.phone} />

              <InfoRow label="Role" value={user.role} />

              <InfoRow
                label="Account Status"
                value={user.isActive ? "Active" : "Inactive"}
              />
            </div>
          </section>

          {/* Dates */}
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-neutral-200">
            <h2 className="text-lg font-bold text-neutral-900">
              Account Timeline
            </h2>

            <div className="mt-5 space-y-4">
              <InfoRow label="Customer ID" value={user._id} />

              <InfoRow label="Created At" value={formatDate(user.createdAt)} />

              <InfoRow label="Updated At" value={formatDate(user.updatedAt)} />
            </div>
          </section>
        </div>

        {/* Admin Notice */}
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-sm font-bold text-amber-900">Admin Access</h2>

          <p className="mt-1 text-sm leading-6 text-amber-800">
            This page only exposes customer information returned by the admin
            user API. Passwords and authentication tokens are intentionally
            excluded by the backend.
          </p>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }) => {
  return (
    <div className="flex flex-col gap-1 border-b border-neutral-100 pb-3 last:border-b-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <span className="text-sm text-neutral-500">{label}</span>

      <span className="break-all text-sm font-medium text-neutral-900 sm:text-right">
        {value || "-"}
      </span>
    </div>
  );
};

export default AdminUserDetails;
