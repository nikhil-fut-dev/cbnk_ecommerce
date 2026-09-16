import { useEffect, useState } from "react";
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Check,
  Home,
  BriefcaseBusiness,
  MoreHorizontal,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  getAddresses,
  createAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
} from "../../services/api/addressApi";

const initialForm = {
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  landmark: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  addressType: "HOME",
  isDefault: false,
};

const Addresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);

  const fetchAddresses = async () => {
    try {
      setLoading(true);

      const data = await getAddresses();

      if (data.success) {
        setAddresses(data.addresses || []);
      } else {
        toast.error(data.message || "Failed to load addresses");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const openAddForm = () => {
    setEditingId(null);
    setForm(initialForm);
    setShowForm(true);
  };

  const openEditForm = (address) => {
    setEditingId(address._id);

    setForm({
      fullName: address.fullName || "",
      phone: address.phone || "",
      addressLine1: address.addressLine1 || "",
      addressLine2: address.addressLine2 || "",
      landmark: address.landmark || "",
      city: address.city || "",
      state: address.state || "",
      postalCode: address.postalCode || "",
      country: address.country || "India",
      addressType: address.addressType || "HOME",
      isDefault: address.isDefault || false,
    });

    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingId(null);
    setForm(initialForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);

      const data = editingId
        ? await updateAddress(editingId, form)
        : await createAddress(form);

      if (!data.success) {
        toast.error(data.message || "Something went wrong");
        return;
      }

      toast.success(
        editingId
          ? "Address updated successfully"
          : "Address added successfully",
      );

      closeForm();
      await fetchAddresses();
    } catch (error) {
      const responseData = error.response?.data;

      if (responseData?.errors) {
        const firstError = Object.values(responseData.errors)[0];

        toast.error(firstError || responseData.message);
      } else {
        toast.error(responseData?.message || "Something went wrong");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const data = await setDefaultAddress(id);

      if (!data.success) {
        toast.error(data.message || "Failed to update default address");
        return;
      }

      toast.success("Default address updated");
      await fetchAddresses();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update default address",
      );
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this address?",
    );

    if (!confirmed) return;

    try {
      const data = await deleteAddress(id);

      if (!data.success) {
        toast.error(data.message || "Failed to delete address");
        return;
      }

      toast.success("Address deleted successfully");
      await fetchAddresses();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete address");
    }
  };

  const getAddressIcon = (type) => {
    if (type === "WORK") {
      return <BriefcaseBusiness size={18} />;
    }

    if (type === "OTHER") {
      return <MoreHorizontal size={18} />;
    }

    return <Home size={18} />;
  };

  if (loading) {
    return (
      <section className="min-h-[500px] px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="animate-pulse">
            <div className="h-8 w-48 rounded bg-neutral-200" />
            <div className="mt-3 h-4 w-72 rounded bg-neutral-100" />

            <div className="mt-10 grid gap-5 md:grid-cols-2">
              <div className="h-56 rounded-2xl bg-neutral-100" />
              <div className="h-56 rounded-2xl bg-neutral-100" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[500px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-col justify-between gap-5 border-b border-neutral-200 pb-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
              Account
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
              My Addresses
            </h1>

            <p className="mt-2 text-sm text-neutral-500">
              Manage your saved delivery addresses.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddForm}
            className="inline-flex items-center justify-center gap-2 bg-neutral-950 px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white transition hover:bg-neutral-800"
          >
            <Plus size={16} />
            Add Address
          </button>
        </div>

        {/* Empty state */}
        {addresses.length === 0 ? (
          <div className="mt-10 flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100">
              <MapPin size={24} className="text-neutral-500" />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-neutral-950">
              No saved addresses
            </h2>

            <p className="mt-2 max-w-md text-sm text-neutral-500">
              Add a delivery address so you can complete your checkout faster.
            </p>

            <button
              type="button"
              onClick={openAddForm}
              className="mt-6 inline-flex items-center gap-2 bg-neutral-950 px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white"
            >
              <Plus size={16} />
              Add Your First Address
            </button>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {addresses.map((address) => (
              <article
                key={address._id}
                className={`relative rounded-2xl border p-5 transition ${
                  address.isDefault
                    ? "border-neutral-950 bg-neutral-50"
                    : "border-neutral-200 bg-white"
                }`}
              >
                {/* Default badge */}
                {address.isDefault && (
                  <div className="absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-neutral-950 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-white">
                    <Check size={12} />
                    Default
                  </div>
                )}

                {/* Type */}
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-700">
                    {getAddressIcon(address.addressType)}
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-400">
                      {address.addressType}
                    </p>

                    <h2 className="mt-1 text-base font-semibold text-neutral-950">
                      {address.fullName}
                    </h2>
                  </div>
                </div>

                {/* Address */}
                <div className="mt-5 space-y-1 text-sm leading-6 text-neutral-600">
                  <p>{address.addressLine1}</p>

                  {address.addressLine2 && <p>{address.addressLine2}</p>}

                  {address.landmark && <p>Landmark: {address.landmark}</p>}

                  <p>
                    {address.city}, {address.state} - {address.postalCode}
                  </p>

                  <p>{address.country}</p>

                  <p className="pt-2 font-medium text-neutral-900">
                    +91 {address.phone}
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-neutral-200 pt-4">
                  <button
                    type="button"
                    onClick={() => openEditForm(address)}
                    className="inline-flex items-center gap-1.5 border border-neutral-200 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-neutral-700 transition hover:border-neutral-950 hover:text-neutral-950"
                  >
                    <Pencil size={13} />
                    Edit
                  </button>

                  {!address.isDefault && (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(address._id)}
                      className="inline-flex items-center gap-1.5 border border-neutral-200 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-neutral-700 transition hover:border-neutral-950 hover:text-neutral-950"
                    >
                      <Check size={13} />
                      Set Default
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDelete(address._id)}
                    className="ml-auto inline-flex items-center gap-1.5 border border-neutral-200 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-red-600 transition hover:border-red-200 hover:bg-red-50"
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Address Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 bg-white px-5 py-4 sm:px-6">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-neutral-400">
                  Delivery
                </p>

                <h2 className="mt-1 text-xl font-semibold text-neutral-950">
                  {editingId ? "Edit Address" : "Add Address"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 transition hover:bg-neutral-200"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
              <div className="grid gap-5 sm:grid-cols-2">
                {/* Full Name */}
                <div>
                  <label className="mb-2 block text-xs font-semibold text-neutral-800">
                    Full Name *
                  </label>

                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    required
                    placeholder="Enter full name"
                    className="w-full border border-neutral-200 px-4 py-3 text-sm outline-none transition focus:border-neutral-950"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="mb-2 block text-xs font-semibold text-neutral-800">
                    Phone *
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    className="w-full border border-neutral-200 px-4 py-3 text-sm outline-none transition focus:border-neutral-950"
                  />
                </div>
              </div>

              {/* Address Line 1 */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-neutral-800">
                  Address Line 1 *
                </label>

                <input
                  type="text"
                  name="addressLine1"
                  value={form.addressLine1}
                  onChange={handleChange}
                  required
                  placeholder="House / Flat / Street"
                  className="w-full border border-neutral-200 px-4 py-3 text-sm outline-none transition focus:border-neutral-950"
                />
              </div>

              {/* Address Line 2 */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-neutral-800">
                  Address Line 2
                </label>

                <input
                  type="text"
                  name="addressLine2"
                  value={form.addressLine2}
                  onChange={handleChange}
                  placeholder="Area / Colony / Locality"
                  className="w-full border border-neutral-200 px-4 py-3 text-sm outline-none transition focus:border-neutral-950"
                />
              </div>

              {/* Landmark */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-neutral-800">
                  Landmark
                </label>

                <input
                  type="text"
                  name="landmark"
                  value={form.landmark}
                  onChange={handleChange}
                  placeholder="Nearby landmark"
                  className="w-full border border-neutral-200 px-4 py-3 text-sm outline-none transition focus:border-neutral-950"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                {/* City */}
                <div>
                  <label className="mb-2 block text-xs font-semibold text-neutral-800">
                    City *
                  </label>

                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    required
                    placeholder="City"
                    className="w-full border border-neutral-200 px-4 py-3 text-sm outline-none transition focus:border-neutral-950"
                  />
                </div>

                {/* State */}
                <div>
                  <label className="mb-2 block text-xs font-semibold text-neutral-800">
                    State *
                  </label>

                  <input
                    type="text"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    required
                    placeholder="State"
                    className="w-full border border-neutral-200 px-4 py-3 text-sm outline-none transition focus:border-neutral-950"
                  />
                </div>

                {/* PIN */}
                <div>
                  <label className="mb-2 block text-xs font-semibold text-neutral-800">
                    PIN Code *
                  </label>

                  <input
                    type="text"
                    name="postalCode"
                    value={form.postalCode}
                    onChange={handleChange}
                    required
                    maxLength={6}
                    placeholder="6-digit PIN"
                    className="w-full border border-neutral-200 px-4 py-3 text-sm outline-none transition focus:border-neutral-950"
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="mb-2 block text-xs font-semibold text-neutral-800">
                    Country
                  </label>

                  <input
                    type="text"
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    className="w-full border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none"
                  />
                </div>
              </div>

              {/* Address Type */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-neutral-800">
                  Address Type
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {["HOME", "WORK", "OTHER"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          addressType: type,
                        }))
                      }
                      className={`flex items-center justify-center gap-2 border px-3 py-3 text-xs font-semibold transition ${
                        form.addressType === type
                          ? "border-neutral-950 bg-neutral-950 text-white"
                          : "border-neutral-200 text-neutral-600 hover:border-neutral-400"
                      }`}
                    >
                      {getAddressIcon(type)}
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Default */}
              <label className="flex cursor-pointer items-center gap-3 border border-neutral-200 p-4">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={form.isDefault}
                  onChange={handleChange}
                  className="h-4 w-4"
                />

                <div>
                  <p className="text-sm font-semibold text-neutral-900">
                    Set as default address
                  </p>

                  <p className="mt-1 text-xs text-neutral-500">
                    This address will be selected automatically during checkout.
                  </p>
                </div>
              </label>

              {/* Buttons */}
              <div className="flex flex-col-reverse gap-3 border-t border-neutral-200 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="border border-neutral-200 px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-neutral-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="bg-neutral-950 px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Address"
                      : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default Addresses;
