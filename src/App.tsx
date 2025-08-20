import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";

// 페이지 컴포넌트 임포트
import Home from "./pages/Home";
import Login from "./pages/Login";
import S3TesterPage from "./pages/S3TesterPage.tsx";
import StorageDebug from "./pages/StorageDebug";

// 인증 컨텍스트 임포트
import { AuthProvider } from "./context/AuthContext";

const App = () => (
    <AuthProvider>
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/s3-tester" element={<S3TesterPage />} />
                <Route path="/debug" element={<StorageDebug />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    </AuthProvider>
);

export default App