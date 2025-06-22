import { TvMinimalPlay } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useContext } from "react";
import { AuthContext } from "@/context/auth-context";
import logo from '../../assets/image/logo.jpg';

function StudentViewCommonHeader() {
  const navigate = useNavigate();
  const { resetCredentials } = useContext(AuthContext);

  function handleLogout() {
    resetCredentials();
    sessionStorage.clear();
  }

  return (
    <header className="flex items-center justify-between p-4 border-b relative">
      <div className="flex items-center space-x-4">
        <Link to="/home" className="flex items-center hover:text-black">
          <img
          src={logo}
          alt="Logo"
          className="h-12 w-12 mr-1 "
          />
          <span className="font-extrabold text-[20px] mr-1 md:text-2xl text-[#f6a818]">
            Drive 
          </span>
            <span className="font-extrabold text-[20px] md:text-2xl text-black">
            Ed.
          </span>
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex gap-4 items-center">

          <Button onClick={handleLogout}>Sign Out</Button>
        </div>
      </div>
    </header>
  );
}

export default StudentViewCommonHeader;
