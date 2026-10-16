import { ArrowDownToLine, ArrowUpFromLine, ChevronRight, Landmark, ShieldCheck } from "lucide-react";
import { useState } from "react";
import Modal from "src/view/shared/modals/Modal";

const actions = [
  {
    name: "Deposit",
    title: "Deposit Funds",
    description: "Fund your demo trading account",
    short: "Add funds",
    icon: ArrowDownToLine,
    color: "positive",
    message: "Demo mode — real deposits are disabled.",
  },
  {
    name: "Withdrawal",
    title: "Withdraw Funds",
    description: "Demo withdrawal simulation",
    short: "Cash out",
    icon: ArrowUpFromLine,
    color: "blue",
    message: "Demo mode — real withdrawals are disabled.",
  },
  {
    name: "KYC",
    title: "Identity Verification (KYC)",
    description: "Not available on demo account",
    short: "Verify identity",
    icon: ShieldCheck,
    color: "amber",
    message: "Identity verification is unavailable in demo mode.",
  },
  {
    name: "Bank",
    title: "Add Bank Account",
    description: "Not available on demo account",
    short: "",
    icon: Landmark,
    color: "purple",
    message: "Bank accounts cannot be added in this demo. No financial credentials are collected.",
  },
];

const visibleCount = { buttons: 2, cards: 3, rows: 4 };

export default function AccountActions({ variant = "cards" }: { variant?: "cards" | "buttons" | "rows" }) {
  const [message, setMessage] = useState("");

  return (
    <>
      <div className={"account-actions " + variant}>
        {actions.slice(0, visibleCount[variant]).map((action) => (
          <button
            key={action.name}
            className={"account-action " + action.color}
            onClick={() => setMessage(action.message)}
          >
            <span className="action-icon">
              <action.icon size={23} />
            </span>
            <span>
              <b>{variant === "rows" ? action.title : action.name}</b>
              {variant !== "buttons" && (
                <small>{variant === "rows" ? action.description : action.short}</small>
              )}
            </span>
            {variant === "rows" && <ChevronRight className="row-chevron" size={17} />}
          </button>
        ))}
      </div>
      {message && (
        <Modal title="Demo account" onClose={() => setMessage("")}>
          <p>{message}</p>
          <button className="primary" onClick={() => setMessage("")}>
            Understood
          </button>
        </Modal>
      )}
    </>
  );
}
