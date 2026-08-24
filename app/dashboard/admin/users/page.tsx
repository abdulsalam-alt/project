"use client";

import {
  UserCheck,
  UserX,
  Users,
} from "lucide-react";

import {
  useSyncExternalStore,
} from "react";

import {
  disableAdminUser,
  getAdminUsers,
  restoreAdminUser,
  subscribeToAdminUsers,
  type AdminUser,
} from "@/lib/admin/adminUsers";

const EMPTY_USERS: AdminUser[] = [];

function getServerUsers() {
  return EMPTY_USERS;
}

export default function AdminUsersPage() {
  const users =
    useSyncExternalStore(
      subscribeToAdminUsers,
      getAdminUsers,
      getServerUsers
    );

  return (
    <main className="px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-2xl font-bold text-[#241507] sm:text-3xl">
          Users
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Manage Teeket users and account
          access.
        </p>

        <section className="mt-7 overflow-hidden rounded-2xl border border-gray-200 bg-white">
          {users.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <Users
                size={40}
                className="mx-auto text-gray-400"
              />

              <h2 className="mt-4 font-semibold">
                No users available
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Registered users will
                appear here once the
                authentication backend
                is connected.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {users.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function UserRow({
  user,
}: {
  user: AdminUser;
}) {
  const disabled =
    user.status === "disabled";

  return (
    <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold text-[#241507]">
          {user.name}
        </p>

        <p className="mt-1 text-sm text-gray-500">
          {user.email}
        </p>

        <span
          className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
            disabled
              ? "bg-red-50 text-red-600"
              : "bg-green-50 text-green-600"
          }`}
        >
          {disabled
            ? "Disabled"
            : "Active"}
        </span>
      </div>

      <button
        type="button"
        onClick={() =>
          disabled
            ? restoreAdminUser(user.id)
            : disableAdminUser(user.id)
        }
        className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold ${
          disabled
            ? "bg-green-600 text-white"
            : "border border-red-200 text-red-600"
        }`}
      >
        {disabled ? (
          <>
            <UserCheck size={18} />
            Restore
          </>
        ) : (
          <>
            <UserX size={18} />
            Disable
          </>
        )}
      </button>
    </div>
  );
}