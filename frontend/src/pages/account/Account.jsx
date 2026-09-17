import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import {
  getProfile,
  updateProfile,
  changePassword,
} from "../../services/api/userApi";
import toast from "react-hot-toast";

const Account = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // --------------------------------------------------
  // PROFILE STATE
  // --------------------------------------------------

  const [profile, setProfile] = useState(null);

  const [profileForm, setProfileForm] = useState({
    fullName: "",
    username: "",
    phone: "",
  });

  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);

  // --------------------------------------------------
  // PASSWORD STATE
  // --------------------------------------------------

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const [passwordSaving, setPasswordSaving] = useState(false);

  // --------------------------------------------------
  // LOAD PROFILE
  // --------------------------------------------------

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setProfileLoading(true);

        const response = await getProfile();

        if (response.success) {
          setProfile(response.user);

          setProfileForm({
            fullName: response.user.fullName || "",
            username: response.user.username || "",
            phone: response.user.phone || "",
          });
        }
      } catch (error) {
        console.error("Profile load error:", error);

        toast.error(error.response?.data?.message || "Unable to load profile");
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, []);

  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // --------------------------------------------------
  // INITIALS
  // --------------------------------------------------

  const getInitials = (name = "") => {
    return (
      name
        .trim()
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase())
        .join("") || "U"
    );
  };

  // --------------------------------------------------
  // PROFILE INPUT CHANGE
  // --------------------------------------------------

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfileForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // --------------------------------------------------
  // UPDATE PROFILE
  // --------------------------------------------------

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    if (!profileForm.fullName.trim()) {
      toast.error("Full name is required");
      return;
    }

    if (!profileForm.username.trim()) {
      toast.error("Username is required");
      return;
    }

    try {
      setProfileSaving(true);

      const response = await updateProfile({
        fullName: profileForm.fullName.trim(),
        username: profileForm.username.trim(),
        phone: profileForm.phone.trim(),
      });

      if (response.success) {
        setProfile(response.user);

        setProfileForm({
          fullName: response.user.fullName || "",
          username: response.user.username || "",
          phone: response.user.phone || "",
        });

        toast.success(response.message || "Profile updated successfully");
      }
    } catch (error) {
      console.error("Update profile error:", error);

      toast.error(error.response?.data?.message || "Unable to update profile");
    } finally {
      setProfileSaving(false);
    }
  };

  // --------------------------------------------------
  // PASSWORD INPUT CHANGE
  // --------------------------------------------------

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // --------------------------------------------------
  // CHANGE PASSWORD
  // --------------------------------------------------

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    if (!passwordForm.currentPassword) {
      toast.error("Current password is required");
      return;
    }

    if (!passwordForm.newPassword) {
      toast.error("New password is required");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      toast.error("New password must be different from current password");
      return;
    }

    try {
      setPasswordSaving(true);

      const response = await changePassword(passwordForm);

      if (response.success) {
        toast.success(
          response.message ||
            "Password changed successfully. Please login again.",
        );

        setPasswordForm({
          currentPassword: "",
          newPassword: "",
        });

        /*
         * Backend clears accessToken and refreshToken
         * after successful password change.
         *
         * Therefore user must login again.
         */
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 1200);
      }
    } catch (error) {
      console.error("Change password error:", error);

      toast.error(error.response?.data?.message || "Unable to change password");
    } finally {
      setPasswordSaving(false);
    }
  };

  // --------------------------------------------------
  // DISPLAY USER
  // --------------------------------------------------

  const displayUser = profile || user;

  // --------------------------------------------------
  // ACCOUNT LINKS
  // --------------------------------------------------

  const accountLinks = [
    {
      title: "My Orders",
      description: "Track, view and manage your orders",
      icon: "📦",
      to: "/account/orders",
    },
    {
      title: "My Addresses",
      description: "Manage your delivery addresses",
      icon: "📍",
      to: "/account/addresses",
    },
    {
      title: "My Reviews",
      description: "Manage your ratings and product reviews",
      icon: "⭐",
      to: "/account/reviews",
    },
    {
      title: "Wishlist",
      description: "View products you've saved",
      icon: "♡",
      to: "/wishlist",
    },
    {
      title: "Shopping Cart",
      description: "Review items ready for checkout",
      icon: "🛒",
      to: "/cart",
    },
  ];

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <main className="min-h-screen bg-[#f7f7f5] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm">
          <Link
            to="/"
            className="text-neutral-500 transition hover:text-neutral-900"
          >
            Home
          </Link>

          <span className="text-neutral-300">/</span>

          <span className="font-medium text-neutral-900">My Account</span>
        </div>

        {/* Account Header */}
        <section className="overflow-hidden rounded-3xl bg-neutral-950 text-white shadow-xl">
          <div className="relative px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
            {/* Decorative elements */}
            <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/[0.04]" />

            <div className="pointer-events-none absolute -bottom-32 right-32 h-72 w-72 rounded-full bg-white/[0.03]" />

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              {/* User Information */}
              <div className="flex items-center gap-4 sm:gap-5">
                {/* Avatar */}
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white text-xl font-bold text-neutral-900 shadow-lg sm:h-20 sm:w-20 sm:text-2xl">
                  {displayUser?.avatar ? (
                    <img
                      src={displayUser.avatar}
                      alt={displayUser?.fullName || "User"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    getInitials(displayUser?.fullName)
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium text-neutral-400">
                    Welcome back
                  </p>

                  <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                    {displayUser?.fullName || "Customer"}
                  </h1>

                  <p className="mt-1 text-sm text-neutral-400">
                    {displayUser?.email || "Your account"}
                  </p>
                </div>
              </div>

              <Link
                to="/"
                className="w-fit rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </section>

        {/* Main Dashboard */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* LEFT CONTENT */}
          <div className="space-y-6">
            {/* Quick Access */}
            <section>
              <div className="mb-4">
                <h2 className="text-xl font-bold tracking-tight text-neutral-900">
                  Quick Access
                </h2>

                <p className="mt-1 text-sm text-neutral-500">
                  Everything you need to manage your CBNK account.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {accountLinks.map((item) => (
                  <Link
                    key={item.title}
                    to={item.to}
                    className="group rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-100 text-xl transition group-hover:bg-neutral-900 group-hover:text-white">
                        {item.icon}
                      </div>

                      <span className="text-lg text-neutral-300 transition group-hover:translate-x-1 group-hover:text-neutral-900">
                        →
                      </span>
                    </div>

                    <h3 className="mt-5 font-semibold text-neutral-900">
                      {item.title}
                    </h3>

                    <p className="mt-1 text-sm leading-5 text-neutral-500">
                      {item.description}
                    </p>
                  </Link>
                ))}
              </div>
            </section>

            {/* Personal Information */}
            <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
              <div className="border-b border-neutral-100 px-5 py-5 sm:px-6">
                <h2 className="font-bold text-neutral-900">
                  Personal Information
                </h2>

                <p className="mt-1 text-sm text-neutral-500">
                  Manage your account information
                </p>
              </div>

              {profileLoading ? (
                <div className="px-5 py-12 text-center sm:px-6">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-900" />

                  <p className="mt-4 text-sm text-neutral-500">
                    Loading profile...
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleProfileSubmit}
                  className="space-y-5 px-5 py-6 sm:px-6"
                >
                  {/* Full Name */}
                  <div>
                    <label
                      htmlFor="fullName"
                      className="mb-2 block text-sm font-medium text-neutral-700"
                    >
                      Full Name
                    </label>

                    <input
                      id="fullName"
                      type="text"
                      name="fullName"
                      value={profileForm.fullName}
                      onChange={handleProfileChange}
                      maxLength={100}
                      required
                      className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-900 focus:bg-white"
                      placeholder="Enter your full name"
                    />
                  </div>

                  {/* Username */}
                  <div>
                    <label
                      htmlFor="username"
                      className="mb-2 block text-sm font-medium text-neutral-700"
                    >
                      Username
                    </label>

                    <input
                      id="username"
                      type="text"
                      name="username"
                      value={profileForm.username}
                      onChange={handleProfileChange}
                      minLength={3}
                      maxLength={30}
                      required
                      className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-900 focus:bg-white"
                      placeholder="Enter your username"
                    />

                    <p className="mt-2 text-xs text-neutral-400">
                      Only letters, numbers and underscores are allowed.
                    </p>
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-medium text-neutral-700"
                    >
                      Email Address
                    </label>

                    <input
                      id="email"
                      type="email"
                      value={profile?.email || ""}
                      disabled
                      className="w-full cursor-not-allowed rounded-xl border border-neutral-200 bg-neutral-100 px-4 py-3 text-sm text-neutral-500"
                    />

                    <p className="mt-2 text-xs text-neutral-400">
                      Email address cannot be changed from this page.
                    </p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-2 block text-sm font-medium text-neutral-700"
                    >
                      Phone Number
                    </label>

                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      value={profileForm.phone}
                      onChange={handleProfileChange}
                      className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-900 focus:bg-white"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  {/* Account Type */}
                  <div>
                    <label
                      htmlFor="accountType"
                      className="mb-2 block text-sm font-medium text-neutral-700"
                    >
                      Account Type
                    </label>

                    <input
                      id="accountType"
                      type="text"
                      value={profile?.role || "CUSTOMER"}
                      disabled
                      className="w-full cursor-not-allowed rounded-xl border border-neutral-200 bg-neutral-100 px-4 py-3 text-sm font-semibold text-neutral-500"
                    />
                  </div>

                  {/* Save */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={profileSaving}
                      className="rounded-xl bg-neutral-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {profileSaving ? "Saving Changes..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              )}
            </section>

            {/* Change Password */}
            <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
              <div className="border-b border-neutral-100 px-5 py-5 sm:px-6">
                <h2 className="font-bold text-neutral-900">Change Password</h2>

                <p className="mt-1 text-sm text-neutral-500">
                  Update your password to keep your account secure.
                </p>
              </div>

              <form
                onSubmit={handlePasswordSubmit}
                className="space-y-5 px-5 py-6 sm:px-6"
              >
                {/* Current Password */}
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="mb-2 block text-sm font-medium text-neutral-700"
                  >
                    Current Password
                  </label>

                  <input
                    id="currentPassword"
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-900 focus:bg-white"
                    placeholder="Enter your current password"
                  />
                </div>

                {/* New Password */}
                <div>
                  <label
                    htmlFor="newPassword"
                    className="mb-2 block text-sm font-medium text-neutral-700"
                  >
                    New Password
                  </label>

                  <input
                    id="newPassword"
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-900 focus:bg-white"
                    placeholder="Enter your new password"
                  />

                  <p className="mt-2 text-xs text-neutral-400">
                    New password must contain at least 6 characters.
                  </p>
                </div>

                {/* Password Warning */}
                <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
                  <p className="text-xs leading-5 text-amber-700">
                    After changing your password, your current authentication
                    session will be ended and you will need to login again.
                  </p>
                </div>

                {/* Change Password Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={passwordSaving}
                    className="rounded-xl border border-neutral-900 bg-white px-6 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {passwordSaving
                      ? "Changing Password..."
                      : "Change Password"}
                  </button>
                </div>
              </form>
            </section>
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="space-y-6">
            {/* Account Menu */}
            <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <h2 className="font-bold text-neutral-900">Account</h2>

              <div className="mt-4 divide-y divide-neutral-100">
                <Link
                  to="/account/orders"
                  className="flex items-center justify-between py-3 text-sm transition hover:text-neutral-500"
                >
                  <span className="font-medium text-neutral-700">Orders</span>

                  <span className="text-neutral-400">→</span>
                </Link>

                <Link
                  to="/account/addresses"
                  className="flex items-center justify-between py-3 text-sm transition hover:text-neutral-500"
                >
                  <span className="font-medium text-neutral-700">
                    Addresses
                  </span>

                  <span className="text-neutral-400">→</span>
                </Link>

                <Link
                  to="/account/reviews"
                  className="flex items-center justify-between py-3 text-sm transition hover:text-neutral-500"
                >
                  <span className="font-medium text-neutral-700">Reviews</span>

                  <span className="text-neutral-400">→</span>
                </Link>

                <Link
                  to="/wishlist"
                  className="flex items-center justify-between py-3 text-sm transition hover:text-neutral-500"
                >
                  <span className="font-medium text-neutral-700">Wishlist</span>

                  <span className="text-neutral-400">→</span>
                </Link>

                <Link
                  to="/cart"
                  className="flex items-center justify-between py-3 text-sm transition hover:text-neutral-500"
                >
                  <span className="font-medium text-neutral-700">Cart</span>

                  <span className="text-neutral-400">→</span>
                </Link>
              </div>
            </section>

            {/* Support */}
            <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-lg">
                ?
              </div>

              <h2 className="mt-4 font-bold text-neutral-900">Need Help?</h2>

              <p className="mt-1 text-sm leading-5 text-neutral-500">
                Manage your orders, addresses and account from this dashboard.
              </p>

              <Link
                to="/account/orders"
                className="mt-4 inline-flex text-sm font-semibold text-neutral-900 hover:underline"
              >
                View your orders →
              </Link>
            </section>

            {/* Logout */}
            <section className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-neutral-900">Sign out</h2>

              <p className="mt-1 text-sm text-neutral-500">
                Sign out of your CBNK account on this device.
              </p>

              <button
                type="button"
                onClick={handleLogout}
                className="mt-4 w-full rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                Logout
              </button>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default Account;
