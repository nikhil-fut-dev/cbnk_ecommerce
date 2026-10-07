import { Link } from "react-router-dom";

const homeSections = [
  {
    title: "Promotional Ticker",
    description: "Manage homepage promotional messages and coupon text.",
    path: "/admin/home/promotional-ticker",
  },
  {
    title: "Hero Banners",
    description: "Manage desktop and mobile hero banners.",
    path: "/admin/home/hero-banners",
  },
  {
    title: "Character Mode",
    description: "Manage Men, Women, Boys, Girls and other character cards.",
    path: "/admin/home/character-modes",
  },
  {
    title: "CBNK Elite",
    description: "Manage CBNK Elite membership content, benefits and pricing.",
    path: "/admin/home/elite",
  },
  {
    title: "Kids Sets",
    description: "Manage the New In - Kids Sets homepage section.",
    path: "/admin/home/kids-sets",
  },
  {
    title: "Sleepwear Edit",
    description:
      "Manage Sleepwear Edit content, images and product/category links.",
    path: "/admin/home/sleepwear",
  },
  {
    title: "Polo Shop",
    description:
      "Manage The Polo Shop content, images and product/category links.",
    path: "/admin/home/polo-shop",
  },
];

const AdminHome = () => {
  return (
    <div className="space-y-8">
      {/* ==================== HEADER ==================== */}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Home CMS</h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage all customer-facing homepage sections from one place.
        </p>
      </div>

      {/* ==================== INFO ==================== */}

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Homepage Content Management
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-600">
          Select a section below to manage its content, images, status, ordering
          and related category or product data.
        </p>
      </div>

      {/* ==================== CMS SECTIONS ==================== */}

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {homeSections.map((section) => (
          <div
            key={section.path}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex min-h-[180px] flex-col">
              <h2 className="text-lg font-semibold text-gray-900">
                {section.title}
              </h2>

              <p className="mt-2 flex-1 text-sm leading-6 text-gray-500">
                {section.description}
              </p>

              <Link
                to={section.path}
                className="mt-6 inline-flex w-fit items-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                Manage Section
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminHome;
