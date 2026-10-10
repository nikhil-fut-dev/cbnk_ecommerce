import { Link } from "react-router-dom";
import {
  Megaphone,
  Image,
  Users,
  Crown,
  Baby,
  Moon,
  Shirt,
  ArrowUpRight,
  LayoutDashboard,
  Settings2,
} from "lucide-react";

const homeSections = [
  {
    title: "Promotional Ticker",
    description:
      "Manage promotional messages, offers, announcements and coupon text.",
    path: "/admin/home/promotional-ticker",
    icon: Megaphone,
    category: "Marketing",
    number: "01",
  },
  {
    title: "Hero Banners",
    description:
      "Manage desktop and mobile hero banners displayed on the homepage.",
    path: "/admin/home/hero-banners",
    icon: Image,
    category: "Visual Content",
    number: "02",
  },
  {
    title: "Character Mode",
    description:
      "Manage Men, Women, Boys, Girls and other character-based collections.",
    path: "/admin/home/character-modes",
    icon: Users,
    category: "Collections",
    number: "03",
  },
  {
    title: "CBNK Elite",
    description:
      "Manage membership content, benefits, pricing and Elite promotions.",
    path: "/admin/home/elite",
    icon: Crown,
    category: "Membership",
    number: "04",
  },
  {
    title: "Kids Sets",
    description:
      "Manage Kids Sets imagery, collection content and call-to-action links.",
    path: "/admin/home/kids-sets",
    icon: Baby,
    category: "Collections",
    number: "05",
  },
  {
    title: "Sleepwear Edit",
    description:
      "Manage sleepwear campaigns, responsive images and destination links.",
    path: "/admin/home/sleepwear",
    icon: Moon,
    category: "Campaigns",
    number: "06",
  },
  {
    title: "Polo Shop",
    description:
      "Manage Polo Shop banners, promotional content and destination links.",
    path: "/admin/home/polo-shop",
    icon: Shirt,
    category: "Campaigns",
    number: "07",
  },
];

const AdminHome = () => {
  return (
    <main className="min-h-screen space-y-8 bg-gray-50/70 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600">
            <LayoutDashboard size={14} />
            Content Management System
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
            Homepage CMS
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
            Manage the content, visuals and campaigns displayed on your
            customer-facing homepage.
          </p>
        </div>

        <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm">
          <Settings2 size={17} className="text-gray-500" />
          <span>Section Management</span>
        </div>
      </header>

      {/* Overview */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">
              Homepage Sections
            </p>
            <div className="rounded-xl bg-gray-100 p-2.5">
              <LayoutDashboard size={19} className="text-gray-700" />
            </div>
          </div>

          <p className="mt-4 text-3xl font-bold tracking-tight text-gray-950">
            {homeSections.length}
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Available management areas
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">
              Content Categories
            </p>
            <div className="rounded-xl bg-gray-100 p-2.5">
              <Settings2 size={19} className="text-gray-700" />
            </div>
          </div>

          <p className="mt-4 text-3xl font-bold tracking-tight text-gray-950">
            {new Set(homeSections.map((section) => section.category)).size}
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Types of homepage content
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">Quick Access</p>
            <div className="rounded-xl bg-gray-100 p-2.5">
              <ArrowUpRight size={19} className="text-gray-700" />
            </div>
          </div>

          <p className="mt-4 text-lg font-bold text-gray-950">
            Manage with ease
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Open any section to update its content.
          </p>
        </div>
      </section>

      {/* Section heading */}
      <section>
        <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-gray-950">
              Manage Homepage Content
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Select a section to view and manage its settings.
            </p>
          </div>

          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
            {String(homeSections.length).padStart(2, "0")} sections available
          </p>
        </div>

        {/* CMS Cards */}
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {homeSections.map((section) => {
            const Icon = section.icon;

            return (
              <article
                key={section.path}
                className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-gray-300 hover:shadow-lg sm:p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-800 transition-colors group-hover:bg-gray-900 group-hover:text-white">
                    <Icon size={22} strokeWidth={1.8} />
                  </div>

                  <span className="rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-400">
                    {section.number}
                  </span>
                </div>

                <div className="mt-5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    {section.category}
                  </span>

                  <h3 className="mt-1.5 text-lg font-bold text-gray-900">
                    {section.title}
                  </h3>

                  <p className="mt-2 min-h-[66px] text-sm leading-6 text-gray-500">
                    {section.description}
                  </p>
                </div>

                <div className="mt-5 border-t border-gray-100 pt-4">
                  <Link
                    to={section.path}
                    className="inline-flex min-h-11 w-full items-center justify-between rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-gray-900 hover:bg-gray-900 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                  >
                    <span>Manage Section</span>
                    <ArrowUpRight
                      size={17}
                      className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Information */}
      <footer className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-gray-100 p-2">
            <Settings2 size={18} className="text-gray-700" />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Content management tip
            </h3>
            <p className="mt-1 text-sm leading-6 text-gray-500">
              Before saving homepage changes, verify the images, content,
              destination links and display settings in the relevant section.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default AdminHome;
