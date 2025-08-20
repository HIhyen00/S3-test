import React from 'react';
import UserSearch from '../components/UserSearch';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const UserSearchPage: React.FC = () => {
  return (
    <div className="bg-[#1a1a1a] text-white min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link to="/" className="mr-4 text-gray-400 hover:text-white transition-colors">
              <FiArrowLeft className="h-6 w-6" />
            </Link>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
              회원 검색
            </h1>
          </div>
          <Link to="/" className="flex items-center">
            <div className="h-8 w-8 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="ml-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">Encoring</span>
          </Link>
        </div>

        {/* 검색 안내 텍스트 */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3">회원을 검색하세요</h2>
          <p className="text-gray-400 max-w-lg mx-auto">
            이름 또는 이메일로 회원을 검색할 수 있습니다. 검색 결과에서 회원을 선택하면 상세 정보를 볼 수 있습니다.
          </p>
        </div>

        {/* 검색 컴포넌트 */}
        <div className="max-w-xl mx-auto">
          <UserSearch />
        </div>


      </div>
    </div>
  );
};

export default UserSearchPage;
