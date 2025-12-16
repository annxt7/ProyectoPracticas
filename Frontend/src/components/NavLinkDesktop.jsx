import { Link } from "react-router-dom";

const NavLinkDesktop = ({ icon, label, active, page }) => (
  <Link
    className={`flex items-center gap-2 transition hover:opacity-100 ${
      active ? "opacity-100 font-bold" : "opacity-50"
    }`}
    to={page}>
    {icon}
    <span className="text-sm">{label}</span>
  </Link>
);
export default NavLinkDesktop;
