import { useNavigate, Link } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation("home");

  return (
    <div>
      
    </div>
  );
}
