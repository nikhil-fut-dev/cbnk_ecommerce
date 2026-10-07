import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Image as ImageIcon,
} from "lucide-react";

import {
  getAdminKidsSets,
  deleteAdminKidsSet,
  toggleAdminKidsSetStatus,
} from "../../services/adminKidsSetApi";

const AdminKidsSets = () => {
  const [kidsSets, setKidsSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const fetchKidsSets = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminKidsSets();

      const data = response?.kidsSets || response?.data || [];

      setKidsSets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch Kids Sets:", error);

      setError(error?.response?.data?.message || "Failed to load Kids Sets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKidsSets();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this Kids Set?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);

      await deleteAdminKidsSet(id);

      setKidsSets((previous) => previous.filter((item) => item._id !== id));
    } catch (error) {
      console.error("Failed to delete Kids Set:", error);

      alert(error?.response?.data?.message || "Failed to delete Kids Set.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      setTogglingId(id);

      await toggleAdminKidsSetStatus(id);

      await fetchKidsSets();
    } catch (error) {
      console.error("Failed to toggle Kids Set status:", error);

      alert(
        error?.response?.data?.message || "Failed to update Kids Set status.",
      );
    } finally {
      setTogglingId(null);
    }
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-green-100 text-green-700";

      case "DRAFT":
        return "bg-yellow-100 text-yellow-700";

      case "INACTIVE":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kids Sets</h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage Kids Sets displayed on the CBNK homepage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchKidsSets}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          <Link
            to="/admin/home/kids-sets/new"
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            <Plus size={18} />
            Add Kids Set
          </Link>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>

          <button
            type="button"
            onClick={fetchKidsSets}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
          <RefreshCw size={28} className="mx-auto animate-spin text-gray-400" />

          <p className="mt-3 text-sm text-gray-500">Loading Kids Sets...</p>
        </div>
      ) : kidsSets.length === 0 ? (
        /* Empty */
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <ImageIcon size={40} className="mx-auto text-gray-400" />

          <h2 className="mt-4 text-lg font-semibold text-gray-900">
            No Kids Sets found
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Create your first Kids Set to display it on the homepage.
          </p>

          <Link
            to="/admin/home/kids-sets/new"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
          >
            <Plus size={18} />
            Add Kids Set
          </Link>
        </div>
      ) : (
        /* Table */
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Image
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Kids Set
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Category
                  </th>

                  <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Order
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Status
                  </th>

                  <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Active
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 bg-white">
                {kidsSets.map((kidsSet) => {
                  const id = kidsSet._id;

                  return (
                    <tr key={id} className="transition hover:bg-gray-50">
                      {/* Image */}
                      <td className="whitespace-nowrap px-5 py-4">
                        {kidsSet?.image?.url ? (
                          <img
                            src={kidsSet.image.url}
                            alt={kidsSet.image.alt || kidsSet.title}
                            className="h-16 w-24 rounded-lg object-cover ring-1 ring-gray-200"
                          />
                        ) : (
                          <div className="flex h-16 w-24 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                            <ImageIcon size={22} />
                          </div>
                        )}
                      </td>

                      {/* Title / Description */}
                      <td className="max-w-xs px-5 py-4">
                        <div className="font-semibold text-gray-900">
                          {kidsSet.title}
                        </div>

                        {kidsSet.description && (
                          <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                            {kidsSet.description}
                          </p>
                        )}
                      </td>

                      {/* Category */}
                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="text-sm font-medium text-gray-700">
                          {kidsSet?.category?.name || "—"}
                        </span>
                      </td>

                      {/* Sort Order */}
                      <td className="whitespace-nowrap px-5 py-4 text-center">
                        <span className="text-sm font-medium text-gray-700">
                          {kidsSet.sortOrder ?? 0}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="whitespace-nowrap px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                            kidsSet.status,
                          )}`}
                        >
                          {kidsSet.status || "UNKNOWN"}
                        </span>
                      </td>

                      {/* Active Toggle */}
                      <td className="whitespace-nowrap px-5 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(id)}
                          disabled={togglingId === id}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                            kidsSet.isActive ? "bg-green-500" : "bg-gray-300"
                          } ${
                            togglingId === id
                              ? "cursor-not-allowed opacity-50"
                              : ""
                          }`}
                          aria-label={
                            kidsSet.isActive
                              ? "Deactivate Kids Set"
                              : "Activate Kids Set"
                          }
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
                              kidsSet.isActive
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="whitespace-nowrap px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/admin/home/kids-sets/${id}/edit`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                          >
                            <Pencil size={15} />
                            Edit
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDelete(id)}
                            disabled={deletingId === id}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 size={15} />

                            {deletingId === id ? "Deleting..." : "Delete"}
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

export default AdminKidsSets;
