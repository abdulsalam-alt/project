"use client";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  status: "active" | "disabled";
  createdAt: string;
};

const STORAGE_KEY =
  "teeket:admin-users:v1";

const EMPTY_USERS: AdminUser[] = [];

let cachedUsers:
  | AdminUser[]
  | null = null;

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) =>
    listener()
  );
}

function readUsers() {
  if (typeof window === "undefined") {
    return EMPTY_USERS;
  }

  try {
    const raw =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (!raw) {
      return EMPTY_USERS;
    }

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed)
      ? parsed
      : EMPTY_USERS;
  } catch {
    return EMPTY_USERS;
  }
}

function getUsers() {
  if (cachedUsers === null) {
    cachedUsers = readUsers();
  }

  return cachedUsers;
}

function saveUsers(users: AdminUser[]) {
  cachedUsers = [...users];

  if (typeof window !== "undefined") {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(cachedUsers)
    );
  }

  notify();
}

export function getAdminUsers() {
  return getUsers();
}

export function subscribeToAdminUsers(
  listener: () => void
) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function disableAdminUser(
  id: string
) {
  saveUsers(
    getUsers().map((user) =>
      user.id === id
        ? {
            ...user,
            status: "disabled",
          }
        : user
    )
  );
}

export function restoreAdminUser(
  id: string
) {
  saveUsers(
    getUsers().map((user) =>
      user.id === id
        ? {
            ...user,
            status: "active",
          }
        : user
    )
  );
}