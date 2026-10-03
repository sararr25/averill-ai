import { Link, useLocation } from 'react-router-dom';
export function DemoEnvironmentBadge() { return <div className="demo-badge">DEMO ENVIRONMENT</div>; }
export function PlatformSwitcher() { const { pathname } = useLocation(); return <div className="switcher"><span>Demo Simulator</span><div><Link className={pathname === '/instagram' ? 'selected' : ''} to="/instagram">Instagram</Link><Link className={pathname === '/linkedin' ? 'selected' : ''} to="/linkedin">LinkedIn</Link><Link className={pathname === '/brevo' ? 'selected' : ''} to="/brevo">Brevo</Link></div></div>; }
