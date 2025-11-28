import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./home/Home";
import MainLayout from "./layouts/MainLayout";
import Login from "./auth/Login";
import ResetPasswordPage from "./auth/ResetPasswordPage";
import Desktop from "./home/Desktop";
import GoodList from "./picture_service/GoodListForm";
import GoodForm from "./picture_service/GoodForm";
import GoodListChecker from "./picture_service/GoodListCheckerForm";

function App() {
  return (    
    <MainLayout>
      <Routes>     
        <Route path="/login" element={<Login/>}/>           
        <Route path="/core/reset-password-request" element={<ResetPasswordPage />} />
        <Route path="/desktop" element={<Desktop />} />
        <Route path="/goods" element={<GoodList />} />
        <Route path="/goodlist-checker" element={<GoodListChecker />} />
        <Route path="/goods/:id" element={<GoodForm />} />
        <Route path="/goods/new" element={<GoodForm />} />
      </Routes>
    </MainLayout>    
  );
}

export default App;
