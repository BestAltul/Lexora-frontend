import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./home/Home";
import MainLayout from "./layouts/MainLayout";
import Login from "./auth/Login";
import ResetPasswordPage from "./auth/ResetPasswordPage";

function App() {
  return (    
    <MainLayout>
      <Routes>     
        <Route path="/login" element={<Login/>}/>           
        <Route path="/core/reset-password-request" element={<ResetPasswordPage />} />
      </Routes>
    </MainLayout>    
  );
}

export default App;
