import React from "react";
import { FaSearch } from "react-icons/fa";
import { FaGlobe } from "react-icons/fa";
import { FaUserCircle } from "react-icons/fa";
import { FaQuestionCircle } from "react-icons/fa";
import { CgMenuGridO } from "react-icons/cg";
import { Link } from 'react-router-dom';
const Header = () => {
  return (
    <header className="flex flex-1 px-7 align-baseline place-items-center gap-4 bg-white border-b-[#5794b1] border-b-4 h-16">
      <h1 className="text-[30px] font-hebrew-serif text-primary">ל</h1>
      <h1 className="font-english-sans-serif text-text text-xl">
        Lashon Learning
      </h1>
      <div className="flex ml-6 gap-8 font-semibold text-[#666666]">
        <Link to="/"><span className="">home</span></Link>
        <Link to="/wordlist"><span className="">wordlist</span></Link>
      </div>

      
    </header>
  );
};

export default Header;
