import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Pencil,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
} from "lucide-react";

import {
  getAdminCBNKElites,
  deleteAdminCBNKElite,
  toggleAdminCBNKEliteStatus,
} from "../../services/adminEliteApi";

const AdminElite = () => {
  const [elites, setElites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  // =========================================================
  // FETCH ELITE
  // =========================================================

  const fetchElites = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminCBNKElites();

      const data = Array.isArray(response?.elite) ? response.elite : [];

      setElites(data);
    } catch (error) {
      console.error("Failed to fetch CBNK Elite:", error);

      setError(error?.response?.data?.message || "Failed to fetch CBNK Elite");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchElites();
  }, []);

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this CBNK Elite?",
    );

    if (!confirmed) return;

    try {
      setActionLoading(id);
      setError("");

      await deleteAdminCBNKElite(id);

      setElites((prev) => prev.filter((item) => item._id !== id));
    } catch (error) {
      console.error("Failed to delete CBNK Elite:", error);

      setError(error?.response?.data?.message || "Failed to delete CBNK Elite");
    } finally {
      setActionLoading(null);
    }
  };

  // =========================================================
  // TOGGLE STATUS
  // =========================================================

  const handleToggle = async (id) => {
    try {
      setActionLoading(id);
      setError("");

      const response = await toggleAdminCBNKEliteStatus(id);

      const updatedElite = response?.elite;

      if (!updatedElite) {
        await fetchElites();
        return;
      }

      setElites((prev) =>
        prev.map((item) =>
          item._id === id
            ? {
                ...item,
                isActive: updatedElite.isActive,
              }
            : item,
        ),
      );
    } catch (error) {
      console.error("Failed to toggle CBNK Elite:", error);

      setError(
        error?.response?.data?.message || "Failed to update CBNK Elite status",
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Loading CBNK Elite...</span>
        </div>
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CBNK Elite</h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage CBNK Elite membership content.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={fetchElites}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>

          <Link
            to="/admin/home/elite/new"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            <Plus className="h-4 w-4" />
            Add Elite
          </Link>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* EMPTY */}
      {elites.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <h2 className="text-lg font-semibold text-gray-900">
            No CBNK Elite plan found
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Create your first CBNK Elite membership plan.
          </p>

          <Link
            to="/admin/home/elite/new"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            <Plus className="h-4 w-4" />
            Create Elite
          </Link>
        </div>
      ) : (
        /* TABLE */
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Plan
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Pricing
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Validity
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Active
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {elites.map((elite) => {
                  const isActionLoading = actionLoading === elite._id;

                  return (
                    <tr key={elite._id} className="transition hover:bg-gray-50">
                      {/* PLAN */}
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <p className="font-semibold text-gray-900">
                            {elite.title}
                          </p>

                          {elite.subtitle && (
                            <p className="mt-1 text-sm text-gray-500">
                              {elite.subtitle}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* PRICING */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">
                            ₹{elite.sellingPrice}
                          </p>

                          <p className="text-sm text-gray-400 line-through">
                            ₹{elite.originalPrice}
                          </p>
                        </div>
                      </td>

                      {/* VALIDITY */}
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {elite.validityMonths || 0} months
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                            elite.status === "PUBLISHED"
                              ? "bg-green-100 text-green-700"
                              : elite.status === "INACTIVE"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {elite.status}
                        </span>
                      </td>

                      {/* ACTIVE */}
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          disabled={isActionLoading}
                          onClick={() => handleToggle(elite._id)}
                          className="transition disabled:cursor-not-allowed disabled:opacity-50"
                          title={elite.isActive ? "Deactivate" : "Activate"}
                        >
                          {elite.isActive ? (
                            <ToggleRight className="h-7 w-7 text-green-600" />
                          ) : (
                            <ToggleLeft className="h-7 w-7 text-gray-400" />
                          )}
                        </button>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/admin/home/elite/${elite._id}/edit`}
                            className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 hover:text-black"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>

                          <button
                            type="button"
                            disabled={isActionLoading}
                            onClick={() => handleDelete(elite._id)}
                            className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminElite;
