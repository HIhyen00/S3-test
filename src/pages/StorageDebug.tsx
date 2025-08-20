import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const StorageDebug: React.FC = () => {
  const [storageContent, setStorageContent] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newName, setNewName] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const { clearStorage } = useAuth();

  // 로컬 스토리지 내용 가져오기
  const refreshStorage = () => {
    let content = '';
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            const parsed = JSON.parse(value);
            content += `${key}: ${JSON.stringify(parsed, null, 2)}\n\n`;
          } else {
            content += `${key}: null\n\n`;
          }
        } catch (e) {
          content += `${key}: ${localStorage.getItem(key)}\n\n`;
        }
      }
    }
    setStorageContent(content || '로컬 스토리지가 비어있습니다.');
    
    // 로컬 스토리지 데이터 구조 검사
    console.log('로컬 스토리지 데이터 구조 검사:');
    const usersJson = localStorage.getItem('users');
    if (usersJson) {
      try {
        const users = JSON.parse(usersJson);
        console.log('사용자 목록 타입:', typeof users);
        console.log('사용자 목록 배열 여부:', Array.isArray(users));
        console.log('사용자 수:', users.length);
        if (users.length > 0) {
          console.log('첫 번째 사용자:', users[0]);
          console.log('첫 번째 사용자 이메일 타입:', typeof users[0].email);
        }
      } catch (e) {
        console.error('사용자 목록 파싱 오류:', e);
      }
    }
  };

  // 페이지 로드 시 로컬 스토리지 내용 가져오기
  useEffect(() => {
    refreshStorage();
  }, []);

  // 수동으로 사용자 추가
  const addUser = () => {
    if (!newEmail || !newName || !newPassword) {
      setMessage('모든 필드를 입력해주세요.');
      return;
    }

    try {
      // 기존 사용자 목록 가져오기
      const usersJson = localStorage.getItem('users');
      const users = usersJson ? JSON.parse(usersJson) : [];
      
      // 새 사용자 추가
      const newUser = {
        id: `user_${Date.now()}`,
        username: newName,
        email: newEmail.trim(),
        password: newPassword
      };
      
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      setMessage('사용자가 추가되었습니다.');
      setNewEmail('');
      setNewName('');
      setNewPassword('');
      refreshStorage();
    } catch (e) {
      setMessage(`오류 발생: ${e}`);
    }
  };

  // 로컬 스토리지 초기화
  const clearAllStorage = () => {
    localStorage.clear();
    clearStorage();
    setMessage('모든 로컬 스토리지가 초기화되었습니다.');
    refreshStorage();
  };

  // 특정 이메일 사용자 삭제
  const removeUserByEmail = () => {
    if (!newEmail) {
      setMessage('삭제할 이메일을 입력해주세요.');
      return;
    }

    try {
      const usersJson = localStorage.getItem('users');
      if (!usersJson) {
        setMessage('사용자 목록이 없습니다.');
        return;
      }

      const users = JSON.parse(usersJson);
      const filteredUsers = users.filter((user: any) => 
        user.email.toLowerCase().trim() !== newEmail.toLowerCase().trim()
      );

      if (users.length === filteredUsers.length) {
        setMessage(`이메일 ${newEmail}을 가진 사용자를 찾을 수 없습니다.`);
        return;
      }

      localStorage.setItem('users', JSON.stringify(filteredUsers));
      setMessage(`이메일 ${newEmail}을 가진 사용자가 삭제되었습니다.`);
      setNewEmail('');
      refreshStorage();
    } catch (e) {
      setMessage(`오류 발생: ${e}`);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="pt-24 container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">회원 리스트</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">회원</h2>
            <button 
              onClick={refreshStorage}
              className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              새로고침
            </button>
            <pre className="bg-gray-800 p-4 rounded overflow-auto max-h-96 text-sm">
              {storageContent}
            </pre>
          </div>
          
          <div className="bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">사용자 관리</h2>
            
            {message && (
              <div className="mb-4 p-3 bg-gray-800 rounded text-sm">
                {message}
              </div>
            )}
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">사용자 추가/삭제</h3>
              <div className="space-y-3">
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="이메일"
                  className="w-full px-3 py-2 bg-gray-800 rounded"
                />
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="이름"
                  className="w-full px-3 py-2 bg-gray-800 rounded"
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="비밀번호"
                  className="w-full px-3 py-2 bg-gray-800 rounded"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={addUser}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    사용자 추가
                  </button>
                  <button
                    onClick={removeUserByEmail}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    이메일로 삭제
                  </button>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3">회원 관리</h3>
              <button
                onClick={clearAllStorage}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                모든 회원 초기화
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageDebug;
