import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();
  const { login, register, clearStorage, currentUser } = useAuth();
  
  // 이미 로그인되어 있으면 S3TesterPage로 리다이렉션
  useEffect(() => {
    if (currentUser) {
      navigate('/s3-tester');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (isLogin) {
      // 로그인 처리
      if (!email || !password) {
        setError('이메일과 비밀번호를 모두 입력해주세요.');
        return;
      }
      
      console.log('로그인 시도:', email, '비밀번호:', password);
      
      // 테스트용 직접 로그인 처리 (임시)
      if (email.toLowerCase().trim() === 'a1@naver.com' && password === 'a123') {
        const user = {
          id: "user_1755591339615",
          username: "오징어",
          email: "a1@naver.com"
        };
        localStorage.setItem('user', JSON.stringify(user));
        setShowLoginModal(true);
        setTimeout(() => {
          setShowLoginModal(false);
          navigate('/s3-tester');
        }, 1500);
        return;
      }
      
      const success = await login(email, password);
      if (success) {
        setShowLoginModal(true);
        setTimeout(() => {
          setShowLoginModal(false);
          navigate('/s3-tester');
        }, 1500);
      } else {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      }
    } else {
      // 회원가입 처리
      if (!email || !password || !username || !confirmPassword) {
        setError('모든 필드를 입력해주세요.');
        return;
      }
      
      if (password !== confirmPassword) {
        setError('비밀번호가 일치하지 않습니다.');
        return;
      }
      
      // 이메일 정규화
      const normalizedEmail = email.toLowerCase().trim();
      
      try {
        // 사용자 목록 가져오기
        let users = [];
        const usersJson = localStorage.getItem('users');
        
        if (usersJson) {
          try {
            const parsedUsers = JSON.parse(usersJson);
            if (Array.isArray(parsedUsers)) {
              users = parsedUsers;
            }
          } catch (e) {
            // 파싱 오류 무시, 빈 배열로 초기화
            console.error('사용자 목록 파싱 오류:', e);
          }
        }
        
        // 이메일 중복 확인
        const existingUser = users.find((u: any) => 
          u && u.email && u.email.toLowerCase().trim() === normalizedEmail
        );
        
        if (existingUser) {
          setError('이미 사용 중인 이메일입니다. 다른 이메일을 사용해주세요.');
          return;
        }
        
        // 새 사용자 생성
        const newUser = {
          id: `user_${Date.now()}`,
          username,
          email: normalizedEmail,
          password
        };
        
        // 사용자 목록에 추가
        users.push(newUser);
        
        // 저장
        localStorage.setItem('users', JSON.stringify(users));
        
        // 저장 확인
        const savedUsersJson = localStorage.getItem('users');
        if (!savedUsersJson) {
          setError('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
          return;
        }
        
        // 회원가입 성공
        setSuccess('회원가입이 완료되었습니다. 로그인해주세요.');
        setIsLogin(true);
        setEmail('');
        setPassword('');
        setUsername('');
        setConfirmPassword('');
        
        // 로그인 상태로 설정 (선택사항)
        // const { password: _, ...userWithoutPassword } = newUser;
        // login(normalizedEmail, password);
        
      } catch (error) {
        console.error('회원가입 처리 오류:', error);
        setError('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      {/* 로그인 성공 모달 */}
      {showLoginModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70">
          <div className="bg-white rounded-lg p-8 max-w-sm w-full transform transition-all shadow-xl">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-2xl leading-6 font-medium text-gray-900 mb-2">로그인 성공!</h3>
              <p className="text-sm text-gray-500 mb-4">환영합니다!</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="pt-24 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6 bg-gray-900 p-10 rounded-3xl shadow-xl border border-gray-800">
        <div>
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="h-12 w-12 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
            {isLogin ? '로그인' : '회원가입'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            {isLogin ? '계정에 접속하여 소셜 경험을 시작하세요' : '새로운 계정을 만들고 소셜 경험을 시작하세요'}
          </p>
        </div>
        
        {error && (
          <div className="bg-red-900/30 border-l-4 border-red-500 p-4 rounded-xl">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {success && (
          <div className="bg-green-900/30 border-l-4 border-green-500 p-4 rounded-xl">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-400">{success}</p>
              </div>
            </div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md -space-y-px">
            <div className="mb-5">
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1 ml-1">
                이메일
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-700 bg-gray-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
                  placeholder="이메일 주소를 입력하세요"
                />
              </div>
            </div>
            
            <div className="mb-5">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1 ml-1">
                비밀번호
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-700 bg-gray-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
                  placeholder="비밀번호를 입력하세요"
                />
              </div>
            </div>
          </div>

          {!isLogin && (
            <>
              <div className="mb-5">
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1 ml-1">
                  사용자 이름
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-700 bg-gray-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
                    placeholder="사용자 이름을 입력하세요"
                  />
                </div>
              </div>
              
              <div className="mb-5">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1 ml-1">
                  비밀번호 확인
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-700 bg-gray-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
                    placeholder="비밀번호를 다시 입력하세요"
                  />
                </div>
              </div>
            </>
          )}
          
          {isLogin && (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-700 rounded bg-gray-800"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                  로그인 상태 유지
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-400 hover:text-blue-300">
                  비밀번호 찾기
                </a>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform transition duration-150 hover:scale-105"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg className="h-5 w-5 text-blue-200 group-hover:text-blue-100" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </span>
              {isLogin ? '로그인' : '회원가입'}
            </button>
          </div>
        </form>
        
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900 text-gray-400">
                또는
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div>
              <a href="#" className="w-full flex items-center justify-center px-4 py-2 border border-gray-700 rounded-xl shadow-sm text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 transition duration-150">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.022A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.291 2.747-1.022 2.747-1.022.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                GitHub
              </a>
            </div>

            <div>
              <a href="#" className="w-full flex items-center justify-center px-4 py-2 border border-gray-700 rounded-xl shadow-sm text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 transition duration-150">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm6.36 14.83c-1.43-1.74-4.9-1.33-6.36-1.32-.27 0-.55 0-.82-.01-1.49-.04-4.9-.42-6.36 1.32-.31.35-.3.87.02 1.22.14.16.33.27.54.31.21.05.42.03.62-.06 1.84-.63 3.87-.63 5.71-.01 1.11.38 2.33.57 3.57.57 1.45 0 2.89-.31 4.14-.9.36-.17.6-.54.57-.93-.03-.4-.32-.72-.68-.83-.21-.07-.42-.09-.63-.04zM9 8.75c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2-2 .9-2 2zm7.5 3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-12.5-3c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2-2 .9-2 2z" />
                </svg>
                Google
              </a>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm font-medium text-blue-400 hover:text-blue-300 transition duration-150"
          >
            {isLogin ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
          </button>
          <div className="mt-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-sm font-medium text-gray-400 hover:text-gray-300 transition duration-150"
            >
              홈으로 돌아가기
            </button>
          </div>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => {
                // 모든 로컬 스토리지 데이터 완전 초기화
                localStorage.clear();
                clearStorage();
                setEmail('');
                setPassword('');
                setUsername('');
                setConfirmPassword('');
                setError('');
                setSuccess('로컬 스토리지가 완전히 초기화되었습니다. 다시 회원가입해주세요.');
                console.log('로컬 스토리지 완전 초기화 완료');
              }}
              className="text-xs font-medium text-red-400 hover:text-red-300 transition duration-150"
            >
              데이터 완전 초기화 (문제 해결용)
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Login;
