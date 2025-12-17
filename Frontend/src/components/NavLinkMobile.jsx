import { Link } from "react-router-dom";

const NavLinkMobile = ({ icon, active, page}) => (
  <Link className={`p-2 transition ${active ? 'text-primary' : 'text-base-content/50'}`} to ={page}>
    {icon}
  </Link>
);
export default NavLinkMobile;