"use client";

import {
  Banknote,
  CheckCircle2,
  CreditCard,
  Edit3,
  History,
  Landmark,
  LogOut,
  Settings,
  Ticket,
  Wallet,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

import {
  getCurrentOrganizerId,
  getOrganizerAccount,
  getOrganizerAccountSummary,
  getOrganizerPayouts,
  getOrganizerTicketSales,
  getOrganizerTransactions,
  maskAccountNumber,
  saveOrganizerAccount,
  type OrganizerPayoutAccount,
  type OrganizerPayout,
  type OrganizerTicketSale,
  type OrganizerTransaction,
} from "@/lib/dashboard/organizerAccount";

type AccountTab =
  | "overview"
  | "payout-account"
  | "transactions"
  | "tickets"
  | "payouts"
  | "settings";

type Bank = {
  code: string;
  name: string;
};

const banks: Bank[] = [
  { code: "044", name: "Access Bank" },
  { code: "023", name: "Citibank Nigeria" },
  { code: "050", name: "Ecobank Nigeria" },
  { code: "070", name: "Fidelity Bank" },
  { code: "011", name: "First Bank of Nigeria" },
  {
    code: "214",
    name: "First City Monument Bank",
  },
  { code: "103", name: "Globus Bank" },
  {
    code: "058",
    name: "Guaranty Trust Bank",
  },
  { code: "030", name: "Heritage Bank" },
  { code: "301", name: "Jaiz Bank" },
  { code: "082", name: "Keystone Bank" },
  { code: "50211", name: "Kuda Bank" },
  { code: "303", name: "Lotus Bank" },
  { code: "50515", name: "Moniepoint" },
  { code: "999992", name: "Opay" },
  { code: "999991", name: "PalmPay" },
  { code: "076", name: "Polaris Bank" },
  {
    code: "105",
    name: "PremiumTrust Bank",
  },
  {
    code: "101",
    name: "Providus Bank",
  },
  {
    code: "221",
    name: "Stanbic IBTC Bank",
  },
  { code: "232", name: "Sterling Bank" },
  { code: "302", name: "Taj Bank" },
  { code: "033", name: "UBA" },
  { code: "032", name: "Union Bank" },
  { code: "215", name: "Unity Bank" },
  { code: "035", name: "Wema Bank" },
  { code: "057", name: "Zenith Bank" },
];

const tabs: {
  id: AccountTab;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "overview",
    label: "Overview",
    icon: <Wallet size={18} />,
  },
  {
    id: "payout-account",
    label: "Payout Account",
    icon: <Landmark size={18} />,
  },
  {
    id: "transactions",
    label: "Transactions",
    icon: <History size={18} />,
  },
  {
    id: "tickets",
    label: "Tickets Sold",
    icon: <Ticket size={18} />,
  },
  {
    id: "payouts",
    label: "Payouts",
    icon: <Banknote size={18} />,
  },
  {
    id: "settings",
    label: "Settings",
    icon: <Settings size={18} />,
  },
];

export default function OrganizerAccountPage() {
  /*
   * IMPORTANT:
   *
   * We initialize everything directly.
   *
   * There is NO useEffect that calls:
   * setOrganizerId(...)
   * setAccount(...)
   *
   * This fixes the React cascading-render error.
   */

  const organizerId = useMemo(
    () => getCurrentOrganizerId(),
    []
  );

  const [activeTab, setActiveTab] =
    useState<AccountTab>("overview");

  const [account, setAccount] =
    useState<OrganizerPayoutAccount | null>(
      () =>
        getOrganizerAccount(
          getCurrentOrganizerId()
        )
    );

  const [editing, setEditing] =
    useState(false);

  const [bankCode, setBankCode] =
    useState(
      account?.bankCode ?? ""
    );

  const [bankName, setBankName] =
    useState(
      account?.bankName ?? ""
    );

  const [accountNumber, setAccountNumber] =
    useState(
      account?.accountNumber ?? ""
    );

  const [accountName, setAccountName] =
    useState(
      account?.accountName ?? ""
    );

  const [error, setError] =
    useState("");

  const [savedMessage, setSavedMessage] =
    useState("");

  const transactions =
    useMemo(
      () =>
        getOrganizerTransactions(
          organizerId
        ),
      [organizerId]
    );

  const ticketSales =
    useMemo(
      () =>
        getOrganizerTicketSales(
          organizerId
        ),
      [organizerId]
    );

  const payouts =
    useMemo(
      () =>
        getOrganizerPayouts(
          organizerId
        ),
      [organizerId]
    );

  const summary =
    useMemo(
      () =>
        getOrganizerAccountSummary(
          organizerId
        ),
      [organizerId]
    );

  const handleBankChange = (
    value: string
  ) => {
    const selected =
      banks.find(
        (bank) =>
          bank.code === value
      );

    setBankCode(value);
    setBankName(
      selected?.name ?? ""
    );
    setError("");
  };

  const startEditing = () => {
    setBankCode(
      account?.bankCode ?? ""
    );

    setBankName(
      account?.bankName ?? ""
    );

    setAccountNumber(
      account?.accountNumber ?? ""
    );

    setAccountName(
      account?.accountName ?? ""
    );

    setError("");
    setSavedMessage("");
    setEditing(true);
  };

  const cancelEditing = () => {
    setBankCode(
      account?.bankCode ?? ""
    );

    setBankName(
      account?.bankName ?? ""
    );

    setAccountNumber(
      account?.accountNumber ?? ""
    );

    setAccountName(
      account?.accountName ?? ""
    );

    setError("");
    setEditing(false);
  };

  const saveAccount = () => {
    setError("");
    setSavedMessage("");

    if (!bankCode || !bankName) {
      setError(
        "Please select your bank."
      );
      return;
    }

    if (
      !/^\d{10}$/.test(
        accountNumber
      )
    ) {
      setError(
        "Account number must contain exactly 10 digits."
      );
      return;
    }

    if (!accountName.trim()) {
      setError(
        "Account name is required."
      );
      return;
    }

    const saved =
      saveOrganizerAccount({
        organizerId,

        bankCode,

        bankName,

        accountNumber,

        accountName:
          accountName.trim(),
      });

    setAccount(saved);

    setEditing(false);

    setSavedMessage(
      "Payout account saved successfully."
    );
  };

  return (
    <main className="min-h-screen bg-[#FAFAFA] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        {/* HEADER */}

        <div>
          <h1 className="text-2xl font-bold text-[#241507] sm:text-3xl">
            Account
          </h1>

          <p className="mt-2 text-sm text-gray-500 sm:text-base">
            Manage your earnings, payout account,
            ticket sales and transactions.
          </p>
        </div>

        {/* TABS */}

        <div className="mt-7 overflow-x-auto">
          <div className="flex min-w-max gap-2 border-b border-gray-200">
            {tabs.map((tab) => {
              const active =
                activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() =>
                    setActiveTab(
                      tab.id
                    )
                  }
                  className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "border-[#432616] text-[#432616]"
                      : "border-transparent text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {tab.icon}

                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* CONTENT */}

        <div className="mt-7">
          {activeTab ===
            "overview" && (
            <Overview
              summary={summary}
              account={account}
              transactions={
                transactions
              }
              onPayoutAccount={() =>
                setActiveTab(
                  "payout-account"
                )
              }
            />
          )}

          {activeTab ===
            "payout-account" && (
            <PayoutAccount
              account={account}
              editing={editing}
              bankCode={bankCode}
              accountNumber={
                accountNumber
              }
              accountName={
                accountName
              }
              error={error}
              savedMessage={
                savedMessage
              }
              onEdit={
                startEditing
              }
              onCancel={
                cancelEditing
              }
              onSave={
                saveAccount
              }
              onBankChange={
                handleBankChange
              }
              onAccountNumberChange={(
                value
              ) =>
                setAccountNumber(
                  value.replace(
                    /\D/g,
                    ""
                  )
                )
              }
              onAccountNameChange={
                setAccountName
              }
            />
          )}

          {activeTab ===
            "transactions" && (
            <Transactions
              transactions={
                transactions
              }
            />
          )}

          {activeTab ===
            "tickets" && (
            <TicketsSold
              sales={ticketSales}
            />
          )}

          {activeTab ===
            "payouts" && (
            <Payouts
              payouts={payouts}
            />
          )}

          {activeTab ===
            "settings" && (
            <SettingsTab />
          )}
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   OVERVIEW
========================================================= */

function Overview({
  summary,
  account,
  transactions,
  onPayoutAccount,
}: {
  summary: ReturnType<
    typeof getOrganizerAccountSummary
  >;

  account:
    | OrganizerPayoutAccount
    | null;

  transactions:
    OrganizerTransaction[];

  onPayoutAccount: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* STAT CARDS */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Sales"
          value={formatMoney(
            summary.totalSales
          )}
          icon={
            <Banknote size={20} />
          }
        />

        <StatCard
          title="Available Balance"
          value={formatMoney(
            summary.availableBalance
          )}
          icon={
            <Wallet size={20} />
          }
        />

        <StatCard
          title="Tickets Sold"
          value={summary.totalTicketsSold.toLocaleString()}
          icon={
            <Ticket size={20} />
          }
        />

        <StatCard
          title="Total Paid Out"
          value={formatMoney(
            summary.totalPaidOut
          )}
          icon={
            <CreditCard size={20} />
          }
        />
      </div>

      {/* PAYOUT ACCOUNT */}

      <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#241507]">
              Payout Account
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Where your ticket revenue will be paid.
            </p>
          </div>

          <button
            type="button"
            onClick={
              onPayoutAccount
            }
            className="rounded-xl bg-[#432616] px-5 py-3 text-sm font-semibold text-white"
          >
            {account
              ? "Manage Account"
              : "Add Account"}
          </button>
        </div>

        {account ? (
          <div className="mt-5 flex items-center gap-4 rounded-xl bg-gray-50 p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#432616]/10 text-[#432616]">
              <Landmark size={20} />
            </div>

            <div>
              <p className="font-semibold text-[#241507]">
                {account.bankName}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                {maskAccountNumber(
                  account.accountNumber
                )}
              </p>

              <p className="text-sm text-gray-500">
                {account.accountName}
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-xl border border-dashed border-gray-300 p-6 text-center">
            <p className="text-sm text-gray-500">
              You haven't added a payout account yet.
            </p>
          </div>
        )}

        {/* RECENT TRANSACTIONS */}

        <div className="mt-8 border-t border-gray-100 pt-7">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[#241507]">
              Recent Transactions
            </h2>
          </div>

          {transactions.length ===
          0 ? (
            <EmptyState
              title="No transactions yet"
              description="Ticket purchases and other account activity will appear here."
            />
          ) : (
            <div className="mt-4 space-y-3">
              {transactions
                .slice(0, 5)
                .map(
                  (
                    transaction
                  ) => (
                    <TransactionRow
                      key={
                        transaction.id
                      }
                      transaction={
                        transaction
                      }
                    />
                  )
                )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   PAYOUT ACCOUNT
========================================================= */

function PayoutAccount({
  account,
  editing,
  bankCode,
  accountNumber,
  accountName,
  error,
  savedMessage,
  onEdit,
  onCancel,
  onSave,
  onBankChange,
  onAccountNumberChange,
  onAccountNameChange,
}: {
  account:
    | OrganizerPayoutAccount
    | null;

  editing: boolean;

  bankCode: string;

  accountNumber: string;

  accountName: string;

  error: string;

  savedMessage: string;

  onEdit: () => void;

  onCancel: () => void;

  onSave: () => void;

  onBankChange: (
    value: string
  ) => void;

  onAccountNumberChange: (
    value: string
  ) => void;

  onAccountNameChange: (
    value: string
  ) => void;
}) {
  if (
    account &&
    !editing
  ) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#432616]/10 text-[#432616]">
              <Landmark size={23} />
            </div>

            <h2 className="mt-5 text-xl font-semibold text-[#241507]">
              Payout Account
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Your current account for receiving ticket revenue.
            </p>
          </div>

          <button
            type="button"
            onClick={onEdit}
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-300 px-5 text-sm font-semibold text-gray-700"
          >
            <Edit3 size={17} />
            Edit Account
          </button>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          <InfoBox
            label="Bank"
            value={
              account.bankName
            }
          />

          <InfoBox
            label="Account Number"
            value={maskAccountNumber(
              account.accountNumber
            )}
          />

          <InfoBox
            label="Account Name"
            value={
              account.accountName
            }
          />

          <InfoBox
            label="Last Updated"
            value={formatDate(
              account.updatedAt
            )}
          />
        </div>

        {savedMessage && (
          <SuccessMessage
            message={
              savedMessage
            }
          />
        )}
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-8">
      <div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#432616]/10 text-[#432616]">
          <Landmark size={23} />
        </div>

        <h2 className="mt-5 text-xl font-semibold text-[#241507]">
          {account
            ? "Edit Payout Account"
            : "Add Payout Account"}
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-500">
          Enter the bank account where your ticket revenue should be paid.
        </p>
      </div>

      <div className="mt-7 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Bank
          </label>

          <select
            value={bankCode}
            onChange={(event) =>
              onBankChange(
                event.target.value
              )
            }
            className="h-14 w-full rounded-xl border border-gray-200 bg-white px-4 outline-none focus:border-[#432616]"
          >
            <option value="">
              Select bank
            </option>

            {banks.map(
              (bank) => (
                <option
                  key={bank.code}
                  value={bank.code}
                >
                  {bank.name}
                </option>
              )
            )}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Account Number
          </label>

          <input
            type="text"
            inputMode="numeric"
            maxLength={10}
            value={accountNumber}
            onChange={(event) =>
              onAccountNumberChange(
                event.target.value
              )
            }
            placeholder="0123456789"
            className="h-14 w-full rounded-xl border border-gray-200 px-4 outline-none focus:border-[#432616]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Account Name
          </label>

          <input
            type="text"
            value={accountName}
            onChange={(event) =>
              onAccountNameChange(
                event.target.value
              )
            }
            placeholder="Account holder name"
            className="h-14 w-full rounded-xl border border-gray-200 px-4 outline-none focus:border-[#432616]"
          />
        </div>
      </div>

      {error && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-600">
            {error}
          </p>
        </div>
      )}

      <div className="mt-7 flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
        {account && (
          <button
            type="button"
            onClick={
              onCancel
            }
            className="h-12 rounded-xl border border-gray-300 px-6 font-medium"
          >
            Cancel
          </button>
        )}

        <button
          type="button"
          onClick={onSave}
          className="h-12 rounded-xl bg-[#432616] px-7 font-semibold text-white"
        >
          Save Account
        </button>
      </div>
    </section>
  );
}

/* =========================================================
   TRANSACTIONS
========================================================= */

function Transactions({
  transactions,
}: {
  transactions: OrganizerTransaction[];
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-7">
      <h2 className="text-xl font-semibold text-[#241507]">
        Transactions
      </h2>

      <p className="mt-2 text-sm text-gray-500">
        All financial activity related to your events.
      </p>

      {transactions.length ===
      0 ? (
        <EmptyState
          title="No transactions"
          description="Your ticket sales, refunds and payouts will appear here."
        />
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead>
              <tr className="border-b text-xs uppercase text-gray-400">
                <th className="px-4 py-3">
                  Transaction
                </th>

                <th className="px-4 py-3">
                  Event
                </th>

                <th className="px-4 py-3">
                  Amount
                </th>

                <th className="px-4 py-3">
                  Status
                </th>

                <th className="px-4 py-3">
                  Date
                </th>
              </tr>
            </thead>

            <tbody>
              {transactions.map(
                (transaction) => (
                  <tr
                    key={
                      transaction.id
                    }
                    className="border-b last:border-0"
                  >
                    <td className="px-4 py-4 font-medium">
                      {formatTransactionType(
                        transaction.type
                      )}
                    </td>

                    <td className="px-4 py-4 text-sm text-gray-600">
                      {
                        transaction.eventTitle
                      }
                    </td>

                    <td className="px-4 py-4 font-semibold">
                      {formatMoney(
                        transaction.amount
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <StatusBadge
                        status={
                          transaction.status
                        }
                      />
                    </td>

                    <td className="px-4 py-4 text-sm text-gray-500">
                      {formatDate(
                        transaction.createdAt
                      )}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/* =========================================================
   TICKETS SOLD
========================================================= */

function TicketsSold({
  sales,
}: {
  sales: OrganizerTicketSale[];
}) {
  const totalQuantity =
    sales.reduce(
      (total, sale) =>
        total + sale.quantity,
      0
    );

  const totalAmount =
    sales.reduce(
      (total, sale) =>
        total + sale.amount,
      0
    );

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#241507]">
            Tickets Sold
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Track tickets sold across your events.
          </p>
        </div>

        {sales.length > 0 && (
          <div className="rounded-xl bg-gray-50 px-5 py-3">
            <p className="text-xs text-gray-500">
              Total
            </p>

            <p className="font-bold text-[#241507]">
              {totalQuantity} tickets
            </p>

            <p className="text-sm text-gray-500">
              {formatMoney(
                totalAmount
              )}
            </p>
          </div>
        )}
      </div>

      {sales.length ===
      0 ? (
        <EmptyState
          title="No tickets sold"
          description="Ticket purchases will appear here after attendees buy tickets."
        />
      ) : (
        <div className="mt-6 space-y-3">
          {sales.map(
            (sale) => (
              <div
                key={sale.id}
                className="rounded-xl border border-gray-200 p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-[#241507]">
                      {
                        sale.ticketName
                      }
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {
                        sale.eventTitle
                      }
                    </p>

                    {sale.buyerName && (
                      <p className="mt-1 text-xs text-gray-400">
                        Buyer:{" "}
                        {
                          sale.buyerName
                        }
                      </p>
                    )}
                  </div>

                  <div className="sm:text-right">
                    <p className="font-semibold">
                      {sale.quantity}{" "}
                      ticket
                      {sale.quantity !==
                      1
                        ? "s"
                        : ""}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {formatMoney(
                        sale.amount
                      )}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      {formatDate(
                        sale.createdAt
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </section>
  );
}

/* =========================================================
   PAYOUTS
========================================================= */

function Payouts({
  payouts,
}: {
  payouts: OrganizerPayout[];
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-7">
      <h2 className="text-xl font-semibold text-[#241507]">
        Payouts
      </h2>

      <p className="mt-2 text-sm text-gray-500">
        Track money paid from TEEKET to your payout account.
      </p>

      {payouts.length ===
      0 ? (
        <EmptyState
          title="No payouts yet"
          description="Your payout history will appear here."
        />
      ) : (
        <div className="mt-6 space-y-3">
          {payouts.map(
            (payout) => (
              <div
                key={payout.id}
                className="flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold">
                    {formatMoney(
                      payout.amount
                    )}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {
                      payout.bankName
                    }{" "}
                    •{" "}
                    {maskAccountNumber(
                      payout.accountNumber
                    )}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    {formatDate(
                      payout.createdAt
                    )}
                  </p>
                </div>

                <PayoutStatus
                  status={
                    payout.status
                  }
                />
              </div>
            )
          )}
        </div>
      )}
    </section>
  );
}

/* =========================================================
   SETTINGS
========================================================= */

function SettingsTab() {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-7">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
        <Settings size={22} />
      </div>

      <h2 className="mt-5 text-xl font-semibold text-[#241507]">
        Account Settings
      </h2>

      <p className="mt-2 text-sm leading-6 text-gray-500">
        Account preferences and security settings will be managed here.
      </p>

      <div className="mt-7 space-y-3">
        <div className="rounded-xl border p-4">
          <p className="font-medium">
            Account notifications
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Receive notifications about ticket sales and payouts.
          </p>
        </div>

        <div className="rounded-xl border p-4">
          <p className="font-medium">
            Security
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Security and authentication settings can be added here.
          </p>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#432616]/10 text-[#432616]">
          {icon}
        </div>
      </div>

      <p className="mt-5 text-sm text-gray-500">
        {title}
      </p>

      <p className="mt-1 text-xl font-bold text-[#241507]">
        {value}
      </p>
    </div>
  );
}

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-gray-50 p-4">
      <p className="text-xs font-medium uppercase text-gray-400">
        {label}
      </p>

      <p className="mt-2 break-words font-semibold text-[#241507]">
        {value}
      </p>
    </div>
  );
}

function TransactionRow({
  transaction,
}: {
  transaction: OrganizerTransaction;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
          <CheckCircle2
            size={19}
          />
        </div>

        <div>
          <p className="font-medium">
            {formatTransactionType(
              transaction.type
            )}
          </p>

          <p className="text-sm text-gray-500">
            {
              transaction.eventTitle
            }
          </p>
        </div>
      </div>

      <p className="font-semibold">
        {formatMoney(
          transaction.amount
        )}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  return (
    <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold capitalize text-green-700">
      {status}
    </span>
  );
}

function PayoutStatus({
  status,
}: {
  status: string;
}) {
  return (
    <span className="w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold capitalize text-gray-700">
      {status}
    </span>
  );
}

function SuccessMessage({
  message,
}: {
  message: string;
}) {
  return (
    <div className="mt-5 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
      <CheckCircle2 size={17} />
      {message}
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-gray-300 px-5 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
        <History size={22} />
      </div>

      <h3 className="mt-4 font-semibold text-[#241507]">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function formatMoney(
  amount: number
) {
  return `₦${amount.toLocaleString(
    "en-NG"
  )}`;
}

function formatDate(
  date: string
) {
  const parsed =
    new Date(date);

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return date;
  }

  return parsed.toLocaleDateString(
    "en-NG",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

function formatTransactionType(
  type: OrganizerTransaction["type"]
) {
  switch (type) {
    case "ticket-sale":
      return "Ticket Sale";

    case "refund":
      return "Refund";

    case "payout":
      return "Payout";

    default:
      return type;
  }
}