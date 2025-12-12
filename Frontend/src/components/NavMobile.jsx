import { Link } from "react-router";

const NavLinkMobile = ({ icon, active, page}) => (
  <button className={`p-2 transition ${active ? 'text-primary' : 'text-base-content/50'}`}>
    <Link to ={page} >
    {icon}
    </Link> 
  </button>
);
export default NavLinkMobile;