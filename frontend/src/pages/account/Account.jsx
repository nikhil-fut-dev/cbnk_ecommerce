import { useAuth } from "../../context/AuthContext";

const Account = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">My Account</p>

          <h1 className="mt-2 text-3xl font-bold text-neutral-900">
            Welcome, {user?.fullName}
          </h1>

          <div className="mt-6 space-y-2 text-sm text-neutral-600">
            <p>
              <strong>Username:</strong> {user?.username}
            </p>

            <p>
              <strong>Email:</strong> {user?.email}
            </p>

            <p>
              <strong>Role:</strong> {user?.role}
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-8 rounded-xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            Logout
          </button>
        </div>
      </div>
    </main>
  );
};

export default Account;
