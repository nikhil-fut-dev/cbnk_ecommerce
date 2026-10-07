import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getAdminCharacterModes,
  deleteAdminCharacterMode,
  toggleAdminCharacterModeStatus,
} from "../../services/adminCharacterModeApi";

const AdminCharacterModes = () => {
  const [characterModes, setCharacterModes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  const fetchCharacterModes = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminCharacterModes();

      const data = response?.data?.characterModes || response?.data || [];

      setCharacterModes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch character modes:", err);

      setError(
        err?.response?.data?.message || "Failed to load character modes.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharacterModes();
  }, []);

  const handleToggleStatus = async (id) => {
    try {
      setActionLoading(id);

      await toggleAdminCharacterModeStatus(id);

      await fetchCharacterModes();
    } catch (err) {
      console.error("Failed to toggle status:", err);

      alert(
        err?.response?.data?.message ||
          "Failed to update character mode status.",
      );
    } finally {
      setActionLoading("");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this Character Mode?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(id);

      await deleteAdminCharacterMode(id);

      await fetchCharacterModes();
    } catch (err) {
      console.error("Failed to delete character mode:", err);

      alert(err?.response?.data?.message || "Failed to delete character mode.");
    } finally {
      setActionLoading("");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-sm text-gray-500">Loading character modes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Character Modes</h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage the Character Mode section displayed on the customer
            homepage.
          </p>
        </div>

        <Link
          to="/admin/home/character-modes/new"
          className="inline-flex items-center justify-center rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          + Add Character Mode
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Empty */}
      {!error && characterModes.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            No Character Modes Found
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Create your first Character Mode to display it on the homepage.
          </p>

          <Link
            to="/admin/home/character-modes/new"
            className="mt-5 inline-flex rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            Create Character Mode
          </Link>
        </div>
      )}

      {/* Table */}
      {!error && characterModes.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[1100px] w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Image
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Character
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Category
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Order
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Active
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {characterModes.map((item) => {
                  const id = item._id;

                  const imageUrl = item?.image?.url || "";

                  const categoryName =
                    item?.category?.name || item?.category?.title || "—";

                  const status = item?.status || "DRAFT";

                  const isActive = item?.isActive ?? item?.active ?? false;

                  return (
                    <tr key={id} className="transition hover:bg-gray-50">
                      {/* Image */}
                      <td className="px-5 py-4">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item?.title || "Character"}
                            className="h-16 w-16 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                            No image
                          </div>
                        )}
                      </td>

                      {/* Character */}
                      <td className="max-w-xs px-5 py-4">
                        <div className="font-medium text-gray-900">
                          {item?.title || "Untitled"}
                        </div>

                        {item?.description && (
                          <div className="mt-1 line-clamp-2 text-sm text-gray-500">
                            {item.description}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="px-5 py-4 text-sm text-gray-700">
                        {categoryName}
                      </td>

                      {/* Sort Order */}
                      <td className="px-5 py-4 text-sm text-gray-700">
                        {item?.sortOrder ?? 0}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            status === "PUBLISHED"
                              ? "bg-green-100 text-green-700"
                              : status === "INACTIVE"
                                ? "bg-gray-100 text-gray-600"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {status}
                        </span>
                      </td>

                      {/* Active */}
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          disabled={actionLoading === id}
                          onClick={() => handleToggleStatus(id)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                            isActive ? "bg-green-500" : "bg-gray-300"
                          } ${
                            actionLoading === id
                              ? "cursor-not-allowed opacity-50"
                              : ""
                          }`}
                          aria-label={isActive ? "Deactivate" : "Activate"}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                              isActive ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/home/character-modes/${id}/edit`}
                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                          >
                            Edit
                          </Link>

                          <button
                            type="button"
                            disabled={actionLoading === id}
                            onClick={() => handleDelete(id)}
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Delete
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

export default AdminCharacterModes;
