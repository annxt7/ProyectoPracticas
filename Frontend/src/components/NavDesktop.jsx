import { Link } from "react-router";

const NavLinkDesktop = ({ icon, label, active , page }) => (
  <button className={`flex items-center gap-2 transition hover:opacity-100 ${active ? 'opacity-100 font-bold' : 'opacity-50'}`}>
    <Link to ={page} >
    {icon}
    <span className="text-sm">{label}</span>
    </Link>
  </button>
);
export default NavLinkDesktop;