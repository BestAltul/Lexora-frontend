import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./home/Home";
import MainLayout from "./layouts/MainLayout";

function App() {
  return (
    <MainLayout>
      <Routes>        
        {/* <Route path="/home" element={<Home />} />            
        <Route path="*" element={<Navigate to="/dashboard/home" replace />} /> */}
      </Routes>
    </MainLayout>
  );
}

export default App;
