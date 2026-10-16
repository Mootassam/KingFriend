import { BookOpen, ChevronRight, CircleHelp, Headphones, MessageCircle } from "lucide-react";
import { useState } from "react";
import Modal from "src/view/shared/modals/Modal";

const topics = [
  {
    title: "FAQ",
    icon: CircleHelp,
    description: "Answers to common demo account questions.",
    content:
      "All balances and orders are simulated and saved in this browser. Reset Demo Account in Profile restores the initial account. No real money, brokerage connection, or identity verification is involved.",
  },
  {
    title: "Trading Guide",
    icon: BookOpen,
    description: "Get familiar with your trading workspace.",
    content:
      "Choose an instrument in Markets or Market Watch. Select a timeframe, set your lot size and multiplier, then choose Buy or Sell. Confirm the simulated order. Manage positions in Orders; Close realizes the simulated P&L and releases margin. Pending orders execute when the simulated quote reaches your limit.",
  },
  {
    title: "Contact Support",
    icon: MessageCircle,
    description: "Learn about support for this demo.",
    content:
      "This is a local support placeholder. No message is sent or personal information collected. Consult the FAQ and Trading Guide for help with the demo workspace.",
  },
];

export default function SupportPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div>
      <div className="page-title">
        <span className="title-icon">
          <Headphones />
        </span>
        <div>
          <h1>Online Service</h1>
          <small>Your demo workspace help center</small>
        </div>
      </div>
      <div className="service-page">
        <h2>Need help?</h2>
        <p>Find your way around KingFriend.</p>
        <div className="service-grid">
          {topics.map((topic, index) => (
            <button key={topic.title} className="panel help-card" onClick={() => setOpen(index)}>
              <topic.icon className="blue" size={29} />
              <h3>{topic.title}</h3>
              <p>{topic.description}</p>
              <ChevronRight size={19} />
            </button>
          ))}
        </div>
      </div>
      {open !== null && (
        <Modal title={topics[open].title} onClose={() => setOpen(null)}>
          <p>{topics[open].content}</p>
          <button className="primary" onClick={() => setOpen(null)}>
            Got it
          </button>
        </Modal>
      )}
    </div>
  );
}
