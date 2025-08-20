import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiX, FiUser, FiMail, FiInfo, FiHeart, FiMessageCircle, FiImage } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

// 사용자 타입 정의
interface User {
  id: string;
  username: string;
  email: string;
}

const UserSearch: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // 모든 사용자 불러오기
  useEffect(() => {
    const loadUsers = () => {
      setIsLoading(true);
      try {
        const usersJson = localStorage.getItem('users');
        if (usersJson) {
          const parsedUsers = JSON.parse(usersJson);
          if (Array.isArray(parsedUsers)) {
            // 비밀번호 필드 제거
            const usersWithoutPassword = parsedUsers.map(({ password, ...user }) => user);
            setUsers(usersWithoutPassword);
          }
        }
      } catch (error) {
        console.error('사용자 목록 불러오기 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, []);

  // 검색어에 따라 사용자 필터링
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = users.filter(
      user => 
        user.username.toLowerCase().includes(term) || 
        user.email.toLowerCase().includes(term)
    );
    
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  // 검색 입력 핸들러
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowResults(value.trim() !== '');
  };

  // 검색창 초기화
  const clearSearch = () => {
    setSearchTerm('');
    setShowResults(false);
  };
  
  // 사용자 선택 핸들러
  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };
  
  // 모달 닫기 핸들러
  const closeUserModal = () => {
    setShowUserModal(false);
  };
  
  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full max-w-md mx-auto relative" ref={searchRef}>
      {/* 검색 입력 필드 */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="사용자 검색..."
          className="block w-full pl-10 pr-10 py-3 border border-gray-700 bg-gray-800 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
          >
            <FiX className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* 검색 결과 */}
      {showResults && (
        <div className="absolute mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 max-h-80 overflow-y-auto animate-fadeIn">
          {isLoading ? (
            <div className="p-4 text-center text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2">검색 중...</p>
            </div>
          ) : filteredUsers.length > 0 ? (
            <ul>
              {filteredUsers.map(user => (
                <li key={user.id} className="border-b border-gray-700 last:border-b-0">
                  <div 
                    className="flex items-center p-3 hover:bg-gray-700 cursor-pointer transition-colors duration-150"
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                      <FiUser className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-white">{user.username}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <FiInfo className="h-5 w-5 text-blue-400 hover:text-blue-300" />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : searchTerm ? (
            <div className="p-4 text-center text-gray-400">
              <p>검색 결과가 없습니다</p>
            </div>
          ) : null}
        </div>
      )}
      
      {/* 사용자 상세 정보 모달 */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl shadow-2xl max-w-md w-full mx-auto border border-gray-700 overflow-hidden animate-fadeIn">
            {/* 모달 헤더 */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 relative">
              <button 
                onClick={closeUserModal}
                className="absolute top-3 right-3 bg-white bg-opacity-20 rounded-full p-1 hover:bg-opacity-30 transition-all"
              >
                <FiX className="h-5 w-5 text-white" />
              </button>
              <h3 className="text-xl font-bold text-white">사용자 정보</h3>
            </div>
            
            {/* 사용자 프로필 */}
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                  <FiUser className="h-10 w-10 text-white" />
                </div>
                <div className="ml-4">
                  <h4 className="text-xl font-bold text-white">{selectedUser.username}</h4>
                  <div className="flex items-center text-gray-400 mt-1">
                    <FiMail className="h-4 w-4 mr-1" />
                    <span className="text-sm">{selectedUser.email}</span>
                  </div>
                </div>
              </div>
              
              {/* 사용자 통계 */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-800 p-3 rounded-lg text-center">
                  <p className="text-2xl font-bold text-white">{Math.floor(Math.random() * 100)}</p>
                  <p className="text-xs text-gray-400">게시물</p>
                </div>
                <div className="bg-gray-800 p-3 rounded-lg text-center">
                  <p className="text-2xl font-bold text-white">{Math.floor(Math.random() * 1000)}</p>
                  <p className="text-xs text-gray-400">팔로워</p>
                </div>
                <div className="bg-gray-800 p-3 rounded-lg text-center">
                  <p className="text-2xl font-bold text-white">{Math.floor(Math.random() * 500)}</p>
                  <p className="text-xs text-gray-400">팔로잉</p>
                </div>
              </div>
              
              {/* 액션 버튼 */}
              <div className="flex gap-3 mb-3">
                <button className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
                  <FiMessageCircle />
                  <span>메시지</span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 text-white py-2 px-4 rounded-lg transition-colors">
                  <FiHeart />
                  <span>팔로우</span>
                </button>
              </div>
              
              {/* 피드 버튼 추가 */}
              <button 
                onClick={() => {
                  closeUserModal();
                  navigate('/feed?username=DevOps_01');
                }}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                <FiImage />
                <span>피드 보기</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSearch;
