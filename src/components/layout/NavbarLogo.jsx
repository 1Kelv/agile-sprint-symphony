
import React from "react";
import { Link } from "react-router-dom";

const NavbarLogo = () => {
  return (
    <Link to="/" className="flex items-center space-x-2 transition-transform hover:scale-105">
      <div className="w-8 h-8 rounded-md bg-agile-primary flex items-center justify-center">
        <span className="text-white font-bold text-sm">AF</span>
      </div>
      <span className="text-lg font-semibold">AgileFlow</span>
    </Link>
  );
};

export default NavbarLogo;
