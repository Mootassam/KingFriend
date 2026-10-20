import { BookOpen, ChevronRight, CircleHelp, Headphones, MessageCircle } from "lucide-react";
import { useState } from "react";
import chatWidgetBus from "src/view/shared/chat/chatWidgetBus";
import Modal from "src/view/shared/modals/Modal";

const topics = [
  {
    title: "FAQ",
    icon: CircleHelp,
    description: "Answers to common account questions.",
    content:
      "Demo accounts use virtual funds only. Real accounts show the balance and wallets held on our servers in Profile. For deposits, withdrawals, identity verification or anything else about your account, start a live chat with our support team.",
  },
  {
    title: "Trading Guide",
    icon: BookOpen,
    description: "Get familiar with your trading workspace.",
    content:
      "Choose an instrument in Markets or Market Watch. Select a timeframe, set your lot size and multiplier, then choose Buy or Sell. Confirm the order. Manage positions in Orders; Close realizes the P&L and releases margin. Pending orders execute when the quote reaches your limit.",
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
          <small>Help center and live support</small>
        </div>
      </div>
      <div className="service-page">
        <h2>Need help?</h2>
        <p>Find your way around KingFriend, or chat with our support team.</p>
        <div className="service-grid">
          <button className="panel help-card" onClick={() => chatWidgetBus.open()}>
            <MessageCircle className="blue" size={29} />
            <h3>Live Chat</h3>
            <p>Talk to our support team in real time.</p>
            <ChevronRight size={19} />
          </button>
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
