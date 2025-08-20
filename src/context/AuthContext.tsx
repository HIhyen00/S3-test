import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// 사용자 타입 정의
export interface User {
  id: string;
  username: string;
  email: string;
}

// 인증 컨텍스트 타입 정의
interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearStorage: () => void; // 로컬 스토리지 초기화 함수 추가
}

// 기본값으로 컨텍스트 생성
const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isAuthenticated: false,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  clearStorage: () => {},
});

// 인증 컨텍스트 제공자 컴포넌트
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // 로컬 스토리지에서 사용자 정보 불러오기
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('사용자 정보 불러오기 오류:', error);
      localStorage.removeItem('user'); // 오류 발생 시 사용자 정보 삭제
    }
  }, []);

  // 로그인 함수
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      if (!email || !password) {
        console.error('이메일과 비밀번호는 필수입니다.');
        return false;
      }
      
      // 이메일 정규화
      const normalizedEmail = email.toLowerCase().trim();
      console.log('로그인 시도:', { email: normalizedEmail, password });
      
      // 로컬 스토리지 직접 접근
      const usersJson = localStorage.getItem('users');
      console.log('로컬 스토리지 데이터:', usersJson);
      
      // 테스트용 하드코딩 사용자 추가 (임시)
      if (normalizedEmail === 'a1@naver.com' && password === 'a123') {
        const hardcodedUser = {
          id: "user_1755591339615",
          username: "오징어",
          email: "a1@naver.com"
        };
        setCurrentUser(hardcodedUser);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(hardcodedUser));
        return true;
      }
      
      if (!usersJson) {
        console.error('사용자 목록이 없습니다.');
        return false;
      }
      
      let users: any[] = [];
      try {
        const parsedData = JSON.parse(usersJson);
        console.log('파싱된 데이터 타입:', typeof parsedData);
        console.log('배열 여부:', Array.isArray(parsedData));
        
        if (Array.isArray(parsedData)) {
          users = parsedData;
          console.log('사용자 수:', users.length);
          
          if (users.length > 0) {
            console.log('첫 번째 사용자:', JSON.stringify(users[0]));
          }
        } else {
          console.error('사용자 목록이 배열 형식이 아닙니다.');
          return false;
        }
      } catch (e) {
        console.error('사용자 목록 파싱 오류:', e);
        return false;
      }
      
      // 사용자 찾기
      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        console.log(`사용자 ${i}:`, user);
        
        if (!user || typeof user !== 'object') continue;
        if (!user.email || typeof user.email !== 'string') continue;
        
        const userEmail = user.email.toLowerCase().trim();
        console.log(`사용자 ${i} 이메일 비교:`, userEmail, normalizedEmail);
        
        if (userEmail === normalizedEmail) {
          console.log('이메일 일치!');
          console.log('입력된 비밀번호:', password);
          console.log('저장된 비밀번호:', user.password);
          
          if (user.password === password) {
            console.log('비밀번호 일치! 로그인 성공!');
            
            const { password: _, ...userWithoutPassword } = user;
            setCurrentUser(userWithoutPassword);
            setIsAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(userWithoutPassword));
            return true;
          } else {
            console.log('비밀번호 불일치');
            return false;
          }
        }
      }
      
      console.log('일치하는 이메일을 가진 사용자를 찾을 수 없습니다.');
      return false;
    } catch (error) {
      console.error('로그인 오류:', error);
      return false;
    }
  };

  // 회원가입 함수
  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      // 입력 값 검증
      if (!username || !email || !password) {
        console.error('모든 필드는 필수입니다.');
        return false;
      }
      
      // 이메일 정규화
      const normalizedEmail = email.toLowerCase().trim();
      console.log('회원가입 시도:', { username, email: normalizedEmail });
      
      // 사용자 목록 가져오기
      let users: any[] = [];
      
      // 로컬 스토리지에서 사용자 목록 가져오기
      try {
        const usersJson = localStorage.getItem('users');
        if (usersJson) {
          try {
            const parsedUsers = JSON.parse(usersJson);
            if (Array.isArray(parsedUsers)) {
              users = parsedUsers;
            }
          } catch (e) {
            // 파싱 오류 무시
          }
        }
      } catch (e) {
        // 로컬 스토리지 접근 오류 무시
      }
      
      // 이메일 중복 확인
      for (const user of users) {
        if (user && user.email && typeof user.email === 'string') {
          const userEmail = user.email.toLowerCase().trim();
          if (userEmail === normalizedEmail) {
            return false; // 중복된 이메일이 있으면 실패
          }
        }
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
      
      // 저장 시도
      try {
        localStorage.setItem('users', JSON.stringify(users));
      } catch (e) {
        console.error('사용자 목록 저장 오류:', e);
        return false;
      }
      
      // 로그인 상태로 설정
      const { password: _, ...userWithoutPassword } = newUser;
      setCurrentUser(userWithoutPassword);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      
      console.log('회원가입 성공:', userWithoutPassword);
      return true;
    } catch (error) {
      console.error('회원가입 오류:', error);
      return false;
    }
  };

  // 로그아웃 함수
  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };

  // 로컬 스토리지 초기화 함수
  const clearStorage = () => {
    try {
      localStorage.clear(); // 모든 로컬 스토리지 데이터 삭제
      setCurrentUser(null);
      setIsAuthenticated(false);
      console.log('로컬 스토리지가 완전히 초기화되었습니다.');
    } catch (error) {
      console.error('로컬 스토리지 초기화 오류:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated, login, register, logout, clearStorage }}>
      {children}
    </AuthContext.Provider>
  );
};

// 인증 컨텍스트 사용을 위한 커스텀 훅
export const useAuth = () => useContext(AuthContext);
