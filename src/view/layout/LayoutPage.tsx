import {
  ArrowLeftRight,
  ChartNoAxesColumn,
  CircleCheck,
  Headphones,
  House,
  ListOrdered,
  LogOut,
  Menu,
  Moon,
  Newspaper,
  RefreshCw,
  Sun,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { i18n } from "src/i18n";
import authActions from "src/modules/auth/authActions";
import AuthService from "src/modules/auth/authService";
import demoActions from "src/modules/demo/demoActions";
import demoSelectors from "src/modules/demo/demoSelectors";
import layoutActions from "src/modules/layout/layoutActions";
import layoutSelectors from "src/modules/layout/layoutSelectors";
import type { AppDispatch } from "src/modules/store";
import { useTheme } from "src/modules/theme/themeContext";
import { startMarketTicker } from "src/services/marketService";
import { money } from "src/shared/Amount";
import AnimatedPrice from "src/view/shared/AnimatedPrice";
import Change from "src/view/shared/Change";
import DemoBadge from "src/view/shared/DemoBadge";
import Logo from "src/view/shared/Logo";
import CinematicLink from "src/view/shared/cinematic/CinematicLink";

const navigation = [
  { label: "menu.home", path: "/app", icon: House },
  { label: "menu.quotes", path: "/app/quotes", icon: ChartNoAxesColumn },
  { label: "menu.trade", path: "/app/trade", icon: ArrowLeftRight },
  { label: "menu.orders", path: "/app/orders", icon: ListOrdered },
  { label: "menu.news", path: "/app/news", icon: Newspaper },
  { label: "menu.copy", path: "/app/copy", icon: Users },
  { label: "menu.profile", path: "/app/profile", icon: Wallet },
  { label: "menu.service", path: "/app/service", icon: Headphones },
];

export default function LayoutPage({ children }: { children: ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const { pathname } = useLocation();
  const { light, toggle } = useTheme();
  const menuVisible = useSelector(layoutSelectors.selectMenuVisible);
  const lastUpdated = useSelector(layoutSelectors.selectLastUpdated);
  const balance = useSelector(demoSelectors.selectBalance);
  const btc = useSelector(demoSelectors.selectQuote("BTCUSD"));
  const [notice, setNotice] = useState(false);
  const [entering, setEntering] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => startMarketTicker(dispatch), [dispatch]);

  useEffect(() => {
    if (!AuthService.consumeDemoReady()) return;
    setNotice(true);
    setEntering(true);
  }, []);

  useEffect(() => {
    if (!entering) return;
    const timer = setTimeout(() => setEntering(false), 700);
    return () => clearTimeout(timer);
  }, [entering]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(false), 5500);
    return () => clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (!menuVisible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        dispatch(layoutActions.doHideMenu());
        document.querySelector<HTMLElement>(".menu-button")?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuVisible, dispatch]);

  const hideMenu = () => dispatch(layoutActions.doHideMenu());

  return (
    <div className={"app-shell " + (entering ? "shell-entering " : "") + (exiting ? "shell-exiting" : "")}>
      {notice && (
        <div className="demo-ready-notice" role="status">
          <CircleCheck size={21} aria-hidden="true" />
          <span>Demo account ready — $10,000 starting virtual funds!</span>
          <button type="button" aria-label="Dismiss demo confirmation" onClick={() => setNotice(false)}>
            <X size={13} />
          </button>
        </div>
      )}

      <header className="topbar">
        <button
          className="icon-btn menu-button"
          aria-label="Toggle navigation"
          aria-expanded={menuVisible}
          aria-controls="workspace-navigation"
          onClick={() => dispatch(layoutActions.doToggleMenu())}
        >
          {menuVisible ? <X /> : <Menu />}
        </button>
        <Link to="/app" className="brand-link">
          <Logo />
        </Link>
        <DemoBadge />
        <div className="ticker">
          <b>BTCUSD</b>
          <b className="numeric">
            <AnimatedPrice quote={btc} />
          </b>
          <Change value={btc.change} />
          <span className="updated">Updated: {lastUpdated}</span>
          <button className="small-btn" onClick={() => dispatch(demoActions.doTick())}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
        <div className="header-actions">
          <Link to="/app/profile" className="wallet">
            <Wallet size={16} />
            <b className="numeric">{money(balance)}</b>
          </Link>
          <button
            className="icon-btn amber"
            aria-label={light ? "Switch to dark theme" : "Switch to light theme"}
            onClick={toggle}
          >
            {light ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </header>

      {menuVisible && <button className="nav-backdrop" aria-label="Close navigation" onClick={hideMenu} />}

      <aside className={"sidebar " + (menuVisible ? "open" : "")}>
        <nav id="workspace-navigation" aria-label="Main navigation">
          {navigation.map(({ label, path, icon: Icon }) => {
            const active = pathname === path;
            const text = i18n(label);
            return (
              <Link
                key={path}
                to={path}
                aria-label={text}
                title={text}
                onClick={hideMenu}
                aria-current={active ? "page" : undefined}
                className={"nav-item " + (active ? "active " : "") + (active && path === "/app/trade" ? "trade-active" : "")}
              >
                <span className="nav-icon">
                  <Icon size={23} />
                </span>
                <span className="nav-label">{text}</span>
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <CinematicLink
            href="/login"
            title={i18n("menu.exit")}
            aria-label={i18n("menu.exit")}
            className="nav-item nav-item-danger"
            onClick={() => {
              hideMenu();
              setExiting(true);
              dispatch(authActions.doSignout());
            }}
          >
            <span className="nav-icon">
              <LogOut size={23} />
            </span>
            <span className="nav-label">{i18n("menu.exit")}</span>
          </CinematicLink>
        </div>
      </aside>

      <main className="main-view">{children}</main>
    </div>
  );
}
