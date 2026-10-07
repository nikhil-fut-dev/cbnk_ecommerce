import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getAdminPromotionalTickers,
  deleteAdminPromotionalTicker,
  toggleAdminPromotionalTickerStatus,
} from "../../services/adminPromotionalTickerApi";

const AdminPromotionalTicker = () => {
  const [tickers, setTickers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  // ======================================================
  // FETCH
  // ======================================================

  const fetchTickers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminPromotionalTickers();

      setTickers(response?.data || []);
    } catch (error) {
      console.error("Fetch promotional tickers error:", error);

      setError(
        error?.response?.data?.message || "Failed to load promotional tickers.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickers();
  }, []);

  // ======================================================
  // DELETE
  // ======================================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this promotional ticker?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(id);

      await deleteAdminPromotionalTicker(id);

      await fetchTickers();
    } catch (error) {
      console.error("Delete promotional ticker error:", error);

      setError(
        error?.response?.data?.message ||
          "Failed to delete promotional ticker.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ======================================================
  // TOGGLE STATUS
  // ======================================================

  const handleToggleStatus = async (id) => {
    try {
      setActionLoading(id);

      await toggleAdminPromotionalTickerStatus(id);

      await fetchTickers();
    } catch (error) {
      console.error("Toggle promotional ticker error:", error);

      setError(
        error?.response?.data?.message ||
          "Failed to update promotional ticker status.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-gray-500">Loading promotional tickers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ==================== HEADER ==================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Promotional Ticker
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage promotional messages displayed on the homepage.
          </p>
        </div>

        <Link
          to="/admin/home/promotional-ticker/new"
          className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          Add Promotional Ticker
        </Link>
      </div>

      {/* ==================== ERROR ==================== */}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ==================== EMPTY ==================== */}

      {tickers.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            No promotional tickers found
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Create your first promotional ticker.
          </p>

          <Link
            to="/admin/home/promotional-ticker/new"
            className="mt-5 inline-flex rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white"
          >
            Create Ticker
          </Link>
        </div>
      ) : (
        /* ==================== TABLE ==================== */

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Order
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Message
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Coupon
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {tickers.map((ticker) => {
                  const isActionLoading = actionLoading === ticker._id;

                  return (
                    <tr key={ticker._id}>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                        {ticker.sortOrder}
                      </td>

                      <td className="max-w-md px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">
                          {ticker.text}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                        {ticker.couponCode || "—"}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <button
                          type="button"
                          disabled={isActionLoading}
                          onClick={() => handleToggleStatus(ticker._id)}
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            ticker.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {ticker.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/admin/home/promotional-ticker/${ticker._id}/edit`}
                            className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Edit
                          </Link>

                          <button
                            type="button"
                            disabled={isActionLoading}
                            onClick={() => handleDelete(ticker._id)}
                            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
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

export default AdminPromotionalTicker;
