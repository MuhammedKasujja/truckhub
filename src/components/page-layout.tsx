import React from "react"
import {
  ArrowLeft,
  Plus,
  MoreVertical,
  Search,
  Trash2,
  Check,
  Bell,
} from "lucide-react"

/* ------------------------------------------------------------------ */
/*  Reusable Page layout primitives                                    */
/*  Usage (standalone):                                                */
/*    <Page>                                                           */
/*      <PageHeader>                                                   */
/*        <PageTitle subtitle="...">Title</PageTitle>                  */
/*        <PageActions>...buttons...</PageActions>                     */
/*      </PageHeader>                                                  */
/*      <PageBody>...scrollable content...</PageBody>                  */
/*      <PageBottomActions>...buttons...</PageBottomActions>           */
/*    </Page>                                                          */
/*                                                                      */
/*  Usage (with a top navbar):                                         */
/*    <AppShell navbar={<Navbar ... />}>                               */
/*      <Page fullScreen={false}>...</Page>                            */
/*    </AppShell>                                                      */
/*                                                                      */
/*  Also usable as compound components: Page.Header, Page.Title,       */
/*  Page.Actions, Page.Body, Page.BottomActions                        */
/* ------------------------------------------------------------------ */

export function Page({ children, className = "", fullScreen = true }) {
  // `fullScreen` (default): Page owns the full viewport height (h-screen).
  // Set fullScreen={false} when nesting Page under a Navbar/AppShell —
  // it then fills whatever height its flex parent gives it instead.
  return (
    <div
      className={`flex flex-col bg-white ${
        fullScreen ? "h-screen" : "h-full min-h-0 flex-1"
      } ${className}`}
    >
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  AppShell + Navbar — for apps with a persistent top navigation bar  */
/* ------------------------------------------------------------------ */

export function AppShell({ navbar, children, className = "" }) {
  // Viewport-height column: navbar keeps its natural height (shrink-0),
  // Page (passed as children, with fullScreen={false}) fills the rest.
  return (
    <div className={`flex h-screen flex-col overflow-hidden ${className}`}>
      {navbar}
      {children}
    </div>
  )
}

export function Navbar({ brand, links, actions, className = "" }) {
  return (
    <nav
      className={`z-30 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 sm:px-6 ${className}`}
    >
      <div className="flex min-w-0 items-center gap-6">
        {brand}
        {links && (
          <div className="hidden items-center gap-5 sm:flex">{links}</div>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-3">{actions}</div>
    </nav>
  )
}

export function NavLink({
  children,
  active = false,
  className = "",
  ...props
}) {
  return (
    <a
      {...props}
      className={`text-sm font-medium transition-colors ${
        active ? "text-gray-900" : "text-gray-500 hover:text-gray-900"
      } ${className}`}
    >
      {children}
    </a>
  )
}

export function PageHeader({ children, className = "" }) {
  return (
    <header
      className={`sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6 ${className}`}
    >
      {children}
    </header>
  )
}

export function PageTitle({ children, subtitle, onBack, className = "" }) {
  return (
    <div className={`flex min-w-0 items-center gap-3 ${className}`}>
      {onBack && (
        <button
          onClick={onBack}
          aria-label="Go back"
          className="shrink-0 rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          <ArrowLeft size={18} />
        </button>
      )}
      <div className="min-w-0">
        <h1 className="truncate text-lg font-semibold text-gray-900 sm:text-xl">
          {children}
        </h1>
        {subtitle && (
          <p className="truncate text-sm text-gray-500">{subtitle}</p>
        )}
      </div>
    </div>
  )
}

export function PageActions({ children, className = "" }) {
  return (
    <div className={`flex shrink-0 items-center gap-2 ${className}`}>
      {children}
    </div>
  )
}

export function PageBody({ children, className = "", padded = true }) {
  return (
    <main
      className={`flex-1 overflow-y-auto ${
        padded ? "px-4 py-4 sm:px-6 sm:py-6" : ""
      } ${className}`}
    >
      {children}
    </main>
  )
}

export function PageBottomActions({ children, className = "", align = "end" }) {
  const justify =
    align === "between"
      ? "justify-between"
      : align === "start"
        ? "justify-start"
        : "justify-end"
  return (
    <footer
      className={`sticky bottom-0 z-20 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6 ${className}`}
    >
      <div className={`flex items-center gap-3 ${justify}`}>{children}</div>
    </footer>
  )
}

// Compound-component sugar: <Page.Header>, <Page.Body>, etc.
Page.Header = PageHeader
Page.Title = PageTitle
Page.Actions = PageActions
Page.Body = PageBody
Page.BottomActions = PageBottomActions

/* ------------------------------------------------------------------ */
/*  Small reusable button helpers (optional, used in the demo below)   */
/* ------------------------------------------------------------------ */

export function IconButton({ children, ...props }) {
  return (
    <button
      {...props}
      className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
    >
      {children}
    </button>
  )
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}) {
  const styles =
    variant === "primary"
      ? "bg-gray-900 text-white hover:bg-gray-700"
      : variant === "danger"
        ? "bg-red-50 text-red-600 hover:bg-red-100"
        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
  return (
    <button
      {...props}
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${styles} ${className}`}
    >
      {children}
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  Demo: shows the layout in action with a scrollable list            */
/* ------------------------------------------------------------------ */

export default function Demo() {
  const items = Array.from({ length: 40 }, (_, i) => ({
    id: i + 1,
    title: `Task item ${i + 1}`,
    done: i % 4 === 0,
  }))

  return (
    <AppShell
      navbar={
        <Navbar
          brand={
            <span className="text-base font-semibold text-gray-900">Acme</span>
          }
          links={
            <>
              <NavLink href="#">Dashboard</NavLink>
              <NavLink href="#" active>
                Projects
              </NavLink>
              <NavLink href="#">Team</NavLink>
              <NavLink href="#">Settings</NavLink>
            </>
          }
          actions={
            <>
              <IconButton aria-label="Notifications">
                <Bell size={18} />
              </IconButton>
              <div className="h-8 w-8 rounded-full bg-gray-900 text-center text-sm leading-8 font-medium text-white">
                A
              </div>
            </>
          }
        />
      }
    >
      <Page fullScreen={false}>
        <PageHeader>
          <PageTitle
            subtitle={`${items.length} tasks`}
            onBack={() => alert("Back")}
          >
            Project Tasks
          </PageTitle>
          <PageActions>
            <IconButton aria-label="Search">
              <Search size={18} />
            </IconButton>
            <IconButton aria-label="More options">
              <MoreVertical size={18} />
            </IconButton>
            <Button variant="primary">
              <Plus size={16} />
              New
            </Button>
          </PageActions>
        </PageHeader>

        <PageBody>
          <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                      item.done
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-300 text-transparent"
                    }`}
                  >
                    <Check size={12} />
                  </span>
                  <span
                    className={`text-sm ${
                      item.done ? "text-gray-400 line-through" : "text-gray-800"
                    }`}
                  >
                    {item.title}
                  </span>
                </div>
                <IconButton aria-label={`Delete ${item.title}`}>
                  <Trash2 size={16} />
                </IconButton>
              </li>
            ))}
          </ul>
        </PageBody>

        <PageBottomActions>
          <Button variant="secondary">Cancel</Button>
          <Button variant="primary">Save changes</Button>
        </PageBottomActions>
      </Page>
    </AppShell>
  )
}
