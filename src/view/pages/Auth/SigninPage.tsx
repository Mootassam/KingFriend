import { ArrowLeft, ArrowRight, Eye, EyeOff, FlaskConical, LockKeyhole, Mail, Shield, TrendingUp, Zap } from "lucide-react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import authActions from "src/modules/auth/authActions";
import { demoAccount } from "src/modules/demo/demoEnumerators";
import CinematicLink from "src/view/shared/cinematic/CinematicLink";
import { useCinematicNav } from "src/view/shared/cinematic/CinematicProvider";
import Modal from "src/view/shared/modals/Modal";
import "src/view/shared/styles/css/fonts-manrope.css";

const features = [
  [TrendingUp, "Real-time", "market data & charts"],
  [Zap, "Fast simulated", "order execution"],
  [Shield, "Demo balance", "protection"],
] as const;

export default function SigninPage() {
  const dispatch = useDispatch();
  const { go } = useCinematicNav();
  const [showPassword, setShowPassword] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [exiting, setExiting] = useState(false);

  function enterDemo() {
    if (busy) return;
    setBusy(true);
    setExiting(true);
    dispatch(authActions.doSignin());
    go("/app", 650);
  }

  return (
    <div className={"login " + (exiting ? "login-exiting" : "")}>
      <section className="login-intro">
        <span className="login-kicker">TRADE&nbsp;&nbsp; | &nbsp;&nbsp;LEARN&nbsp;&nbsp; | &nbsp;&nbsp;GROW</span>
        <div className="login-hero-content">
          <div className="login-wordmark" role="img" aria-label="KingFriend — Trade with Confidence.">
            <strong>
              King<span>Friend</span>
            </strong>
            <small>TRADE WITH CONFIDENCE.</small>
          </div>
          <p className="login-hero-tagline">Global Markets. Real Opportunities.</p>
          <p className="login-hero-quote">“The best trade is often the one you don't take.”</p>
          <ul className="login-features">
            {features.map(([Icon, first, second]) => (
              <li key={first}>
                <Icon size={33} aria-hidden="true" />
                <span>
                  {first}
                  <br />
                  {second}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <span className="login-market-line">MARKETS&nbsp;&nbsp; CONNECT&nbsp;&nbsp; PEOPLE</span>
      </section>

      <section className="login-form">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            enterDemo();
          }}
        >
          <span className="login-panel-kicker">A GLOBAL LEADER IN ONLINE TRADING</span>
          <h2>
            Sign <span>In</span>
          </h2>
          <p>Access your KingFriend Demo Account</p>
          <label>
            Email Address
            <span className="login-input-wrap">
              <Mail size={20} aria-hidden="true" />
              <input type="email" value={demoAccount.email} readOnly aria-describedby="login-help" />
            </span>
          </label>
          <label>
            Password
            <div className="password">
              <LockKeyhole className="password-lock" size={20} aria-hidden="true" />
              <input type={showPassword ? "text" : "password"} value={demoAccount.password} readOnly />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </label>
          <button type="button" className="text-btn forgot" onClick={() => setForgotOpen(true)}>
            Forgot Password?
          </button>
          <button className="primary signin" type="submit" disabled={busy} aria-busy={busy}>
            <span aria-live="polite">{busy ? "Signing In…" : "Sign In"}</span>
            <ArrowRight size={19} aria-hidden="true" />
          </button>
          <p className="center">
            Don't have an account?{" "}
            <button type="button" className="text-btn" onClick={enterDemo}>
              Open Demo Account
            </button>
          </p>
          <div className="divider">or</div>
          <button className="demo-enter" type="button" onClick={enterDemo} disabled={busy} aria-busy={busy}>
            <FlaskConical size={19} aria-hidden="true" />
            <span aria-live="polite">{busy ? "Starting demo…" : "Try Demo Account — $10,000 Virtual Funds"}</span>
            <ArrowRight className="demo-arrow" size={17} aria-hidden="true" />
          </button>
          <small id="login-help">
            Local demo credentials are prefilled. No registration required.
            <br />
            Virtual funds only.
          </small>
          <CinematicLink className="back" href="/" onClick={() => setExiting(true)}>
            <ArrowLeft size={15} /> Back to Home
          </CinematicLink>
        </form>
      </section>

      {forgotOpen && (
        <Modal title="No password needed" onClose={() => setForgotOpen(false)}>
          <p>
            This workspace uses a local demo session. Select Try Demo Account to enter; no credentials are collected
            or transmitted.
          </p>
          <button className="primary" onClick={enterDemo}>
            Enter demo workspace
          </button>
        </Modal>
      )}
    </div>
  );
}
