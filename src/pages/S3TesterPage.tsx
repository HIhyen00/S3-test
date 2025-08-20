import React from "react";
import {Link, useNavigate} from "react-router-dom";
import S3Tester from "../components/S3Tester";
import Navbar from "../components/Navbar";

const S3TesterPage: React.FC = () => {
  const navigate = useNavigate();

  return (
      <div className="bg-[#1a1a1a] text-white p-6 min-h-screen">
          <Link to="/" className="flex items-center ml-24">
              <div className="h-8 w-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
              </div>
              <span className="ml-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">Encoring</span>
          </Link>

        <S3Tester />
      </div>
  );
};

export default S3TesterPage;
