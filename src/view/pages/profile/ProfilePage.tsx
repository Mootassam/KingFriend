import { BadgeCheck, Copy, Hash, Mail, Pen, RotateCcw, TriangleAlert, User } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import demoActions from "src/modules/demo/demoActions";
import { demoAccount } from "src/modules/demo/demoEnumerators";
import demoSelectors from "src/modules/demo/demoSelectors";
import { money } from "src/shared/Amount";
import AccountActions from "src/view/shared/AccountActions";
import DemoBadge from "src/view/shared/DemoBadge";
import Modal from "src/view/shared/modals/Modal";

// "edit" and "reset" open their own dialogs; any other text is shown as an info message.
type Dialog = "" | "edit" | "reset" | string;

export default function ProfilePage() {
  const dispatch = useDispatch();
  const name = useSelector(demoSelectors.selectName);
  const balance = useSelector(demoSelectors.selectBalance);
  const [dialog, setDialog] = useState<Dialog>("");
  const [draftName, setDraftName] = useState(name);
  const [copied, setCopied] = useState(false);

  const rows = [
    {
      label: "FULL NAME",
      value: name,
      icon: User,
      action: (
        <button
          className="icon-btn"
          aria-label="Edit name"
          onClick={() => {
            setDraftName(name);
            setDialog("edit");
          }}
        >
          <Pen size={16} />
        </button>
      ),
    },
    { label: "EMAIL", value: demoAccount.email, icon: Mail },
    {
      label: "ACCOUNT ID",
      value: demoAccount.uid,
      icon: Hash,
      action: (
        <button
          className="icon-btn"
          aria-label="Copy account ID"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(demoAccount.uid);
              setCopied(true);
            } catch {
              setDialog("Account ID: " + demoAccount.uid);
            }
          }}
        >
          {copied ? <span>Copied</span> : <Copy size={16} />}
        </button>
      ),
    },
    { label: "KYC STATUS", value: "N/A (Demo)", icon: BadgeCheck },
  ];

  const close = () => setDialog("");

  return (
    <div>
      <div className="profile-heading">
        <b>
          <User size={19} /> MY ACCOUNT
        </b>
        <DemoBadge />
      </div>
      <div className="page-padding">
        <div className="demo-banner">
          <TriangleAlert size={22} />
          <div>
            <b>Demo Account — $10,000 Virtual Starting Funds</b>
            <p>This is a practice account. No real money is involved.</p>
            <button onClick={() => setDialog("Live account services are not enabled in this demo.")}>
              Open a Live Account →
            </button>
          </div>
        </div>

        <section className="panel profile-info">
          <h2>PROFILE INFORMATION</h2>
          {rows.map((row) => (
            <div key={row.label} className="profile-row">
              <row.icon size={17} />
              <div>
                <small>{row.label}</small>
                <b>{row.value}</b>
              </div>
              {row.action}
            </div>
          ))}
        </section>

        <section className="panel profile-balance">
          <div>
            <small>ACCOUNT BALANCE</small>
            <h2 className="numeric">{money(balance)}</h2>
          </div>
          <AccountActions variant="buttons" />
        </section>

        <section className="panel profile-services">
          <h2>SERVICES</h2>
          <AccountActions variant="rows" />
        </section>

        <button className="reset-button" onClick={() => setDialog("reset")}>
          <RotateCcw size={16} /> Reset Demo Account
        </button>
      </div>

      {dialog && (
        <Modal
          title={dialog === "edit" ? "Edit display name" : dialog === "reset" ? "Reset demo account?" : "Demo account"}
          onClose={close}
        >
          {dialog === "edit" ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!draftName.trim()) return;
                dispatch(demoActions.doRename(draftName));
                close();
              }}
            >
              <label>
                Full name
                <input autoFocus value={draftName} onChange={(e) => setDraftName(e.target.value)} required maxLength={50} />
              </label>
              <button className="primary" type="submit">
                Save name
              </button>
            </form>
          ) : dialog === "reset" ? (
            <>
              <p>This restores the seeded virtual balance and positions, and clears your pending orders and history.</p>
              <button
                className="primary"
                onClick={() => {
                  dispatch(demoActions.doReset());
                  close();
                }}
              >
                Reset account
              </button>
            </>
          ) : (
            <>
              <p>{dialog}</p>
              <button className="primary" onClick={close}>
                Understood
              </button>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}
