import React, { useState } from "react";
import {Link, useNavigate} from "react-router-dom";
import S3Tester from "../components/S3Tester";
import Navbar from "../components/Navbar";
import UserSearch from "../components/UserSearch";
import { FiUsers, FiChevronDown, FiChevronUp } from "react-icons/fi";

const S3TesterPage: React.FC = () => {
  const navigate = useNavigate();
  const [showSearchPanel, setShowSearchPanel] = useState(false);

  const toggleSearchPanel = () => {
    setShowSearchPanel(!showSearchPanel);
  };

  return (
      <div className="bg-[#1a1a1a] text-white p-6 min-h-screen">
          <div className="flex justify-between items-center max-w-5xl mx-auto mb-6">
              <Link to="/" className="flex items-center">
                  <div className="h-8 w-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
                      <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                  </div>
                  <span className="ml-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">Encoring</span>
              </Link>
              
              <Link 
                  to="/user-search" 
                  className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-blue-400 flex items-center gap-1 transition-colors duration-200"
              >
                  <FiUsers className="h-4 w-4" />
                  <span>회원 검색</span>
              </Link>
          </div>
          


        <S3Tester />
      </div>
  );
};

export default S3TesterPage;
