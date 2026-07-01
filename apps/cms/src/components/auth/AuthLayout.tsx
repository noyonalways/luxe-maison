import { Outlet } from "@tanstack/react-router";

/** Layout for unauthenticated auth pages (login, forgot password). */
export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-secondary">
      <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-4 py-8">
        <Outlet />
      </div>
    </div>
  );
}
