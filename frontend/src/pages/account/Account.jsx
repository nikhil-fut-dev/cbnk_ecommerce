import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Account = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

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
              <div className="flex items-center gap-4 sm:gap-5">
                {/* Avatar */}
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-xl font-bold text-neutral-900 shadow-lg sm:h-20 sm:w-20 sm:text-2xl">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user?.fullName || "User"}
                      className="h-full w-full rounded-2xl object-cover"
                    />
                  ) : (
                    getInitials(user?.fullName)
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium text-neutral-400">
                    Welcome back
                  </p>

                  <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                    {user?.fullName || "Customer"}
                  </h1>

                  <p className="mt-1 text-sm text-neutral-400">
                    {user?.email || "Your account"}
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
          {/* Left */}
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

            {/* Account Information */}
            <section className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
              <div className="border-b border-neutral-100 px-5 py-5 sm:px-6">
                <h2 className="font-bold text-neutral-900">
                  Personal Information
                </h2>

                <p className="mt-1 text-sm text-neutral-500">
                  Your account information
                </p>
              </div>

              <div className="grid gap-x-8 gap-y-6 px-5 py-6 sm:grid-cols-2 sm:px-6">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                    Full Name
                  </p>

                  <p className="mt-2 text-sm font-semibold text-neutral-900">
                    {user?.fullName || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                    Username
                  </p>

                  <p className="mt-2 text-sm font-semibold text-neutral-900">
                    {user?.username ? `@${user.username}` : "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                    Email Address
                  </p>

                  <p className="mt-2 break-all text-sm font-semibold text-neutral-900">
                    {user?.email || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                    Account Type
                  </p>

                  <p className="mt-2 text-sm font-semibold text-neutral-900">
                    {user?.role || "CUSTOMER"}
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Right Sidebar */}
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
