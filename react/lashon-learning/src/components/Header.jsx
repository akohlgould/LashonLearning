import React from "react";
import { FaSearch } from "react-icons/fa";
import { FaGlobe } from "react-icons/fa";
import { FaUserCircle } from "react-icons/fa";
import { FaQuestionCircle } from "react-icons/fa";
import { FaTrash } from "react-icons/fa";
import { CgMenuGridO } from "react-icons/cg";
import { Link, useLocation } from 'react-router-dom';
import { clearCache } from '../services/sefariaApi';

const Header = () => {
  const { pathname } = useLocation();

  const handleClearCache = () => {
    clearCache();
    window.location.reload();
  };

  return (
    <header className="flex flex-1 px-7 align-baseline place-items-center gap-4 bg-white border-b-[#5794b1] border-b-4 h-16">
      <h1 className="text-[30px] font-hebrew-serif text-primary">ל</h1>
      <h1 className="font-english-sans-serif text-text text-xl">
        Lashon Learning
      </h1>
      <div className="flex ml-6 gap-8 font-semibold text-[#666666]">
        <Link to="/" className={pathname === "/" ? "text-primary" : ""}><span>Flashcards</span></Link>
        <Link to="/match" className={pathname === "/match" ? "text-primary" : ""}><span>Match</span></Link>
        <Link to="/wordlist" className={pathname.startsWith("/wordlist") ? "text-primary" : ""}><span>Word List</span></Link>
      </div>

      <button
        onClick={handleClearCache}
        className="ml-auto text-sm text-[#999] hover:text-red-500 flex items-center gap-1 transition-colors"
        title="Clear definition cache"
      >
        <FaTrash size={12} />
        <span>Clear Cache</span>
      </button>
    </header>
  );
};

export default Header;
