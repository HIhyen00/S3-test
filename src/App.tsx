import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";
import S3Tester from "./components/S3Tester.tsx";

const App = () => (
    <div className="bg-[#1a1a1a] text-white p-6">
        {/*<h1 className="text-2xl font-bold mb-4">SNS</h1>*/}
        <S3Tester/>
    </div>
);

export default App