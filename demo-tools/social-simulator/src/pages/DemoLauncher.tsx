import { Link } from 'react-router-dom';
import { DemoEnvironmentBadge } from '../components/shared/DemoControls';
export function DemoLauncher() { return <main className="launcher"><DemoEnvironmentBadge/><div><span className="launcher-kicker">CONTROLLED PRODUCT DEMO</span><h1>Demo Social Simulator</h1><p>Choose a platform to simulate:</p><nav><Link to="/instagram">Instagram Demo <span>↗</span></Link><Link to="/linkedin">LinkedIn Demo <span>↗</span></Link><Link to="/brevo">Brevo Demo <span>↗</span></Link></nav></div></main>; }
