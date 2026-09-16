const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center justify-center">
        <section className="w-full rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-8 text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-neutral-500">
              CBNK
            </p>

            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
              {title}
            </h1>

            {subtitle && (
              <p className="mt-2 text-sm leading-6 text-neutral-500">
                {subtitle}
              </p>
            )}
          </div>

          {children}
        </section>
      </div>
    </main>
  );
};

export default AuthLayout;
