import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";

import {
  getAdminSleepwearEdits,
  deleteAdminSleepwearEdit,
  toggleAdminSleepwearEditStatus,
} from "../../services/adminSleepwearEditApi";

const AdminSleepwearEdits = () => {
  const [sleepwearEdits, setSleepwearEdits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSleepwearEdits = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminSleepwearEdits();

      setSleepwearEdits(
        response?.sleepwearEdits ||
          response?.data?.sleepwearEdits ||
          response?.data ||
          [],
      );
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.message || "Failed to load sleepwear edits",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSleepwearEdits();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this sleepwear edit?",
    );

    if (!confirmed) return;

    try {
      await deleteAdminSleepwearEdit(id);

      setSleepwearEdits((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error(err);

      alert(err?.response?.data?.message || "Failed to delete sleepwear edit");
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleAdminSleepwearEditStatus(id);

      await fetchSleepwearEdits();
    } catch (err) {
      console.error(err);

      alert(err?.response?.data?.message || "Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sleepwear Edit</h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage sleepwear promotional sections.
          </p>
        </div>

        <Link
          to="/admin/home/sleepwear/new"
          className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          <Plus className="h-4 w-4" />
          Add Sleepwear
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Empty */}
      {!error && sleepwearEdits.length === 0 && (
        <div className="rounded-xl border bg-white p-12 text-center">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />

          <h3 className="mt-4 text-lg font-semibold">No Sleepwear Edits</h3>

          <p className="mt-2 text-sm text-gray-500">
            Create your first sleepwear promotional section.
          </p>
        </div>
      )}

      {/* Table */}
      {sleepwearEdits.length > 0 && (
        <div className="overflow-hidden rounded-xl border bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                    Image
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                    Content
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                    Category
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                    Product
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                    Order
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                    Status
                  </th>

                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {sleepwearEdits.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {item.desktopImage?.url && (
                          <img
                            src={item.desktopImage.url}
                            alt={item.desktopImage.alt || item.title}
                            className="h-16 w-24 rounded-lg object-cover"
                          />
                        )}

                        {item.mobileImage?.url && (
                          <img
                            src={item.mobileImage.url}
                            alt={item.mobileImage.alt || item.title}
                            className="h-16 w-12 rounded-lg object-cover"
                          />
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="font-semibold text-gray-900">
                          {item.title}
                        </p>

                        {item.smallText && (
                          <p className="mt-1 text-sm text-gray-500">
                            {item.smallText}
                          </p>
                        )}

                        {item.priceText && (
                          <p className="mt-1 text-sm font-medium">
                            {item.priceText}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm">
                      {item.category?.name || "—"}
                    </td>

                    <td className="px-6 py-4 text-sm">
                      {item.product?.name || "—"}
                    </td>

                    <td className="px-6 py-4 text-sm">{item.sortOrder}</td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <span className="w-fit rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium">
                          {item.status}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleToggle(item._id)}
                          className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${
                            item.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {item.isActive ? "Active" : "Inactive"}
                        </button>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/admin/home/sleepwear/${item._id}/edit`}
                          className="rounded-lg border p-2 hover:bg-gray-50"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleDelete(item._id)}
                          className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSleepwearEdits;
