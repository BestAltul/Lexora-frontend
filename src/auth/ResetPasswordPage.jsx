import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const tokenFromUrl = query.get("token");
    if (!tokenFromUrl) {
      setMessage("Wrong link.");
    } else {
      setToken(tokenFromUrl);
    }
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage("Passwords mismatchs!");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/v3/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Success!");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setMessage(data.message || "Error resetting password.");
      }
    } catch (err) {
      setMessage("Error resetting password on the server.");
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto", textAlign: "center" }}>
      <h2>Password reset</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 10 }}>
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{ width: "100%", padding: 8 }}
            required
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <input
            type="password"
            placeholder="Confrim Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ width: "100%", padding: 8 }}
            required
          />
        </div>
        <button type="submit" style={{ width: "100%", padding: 10 }}>
          Reset Password
        </button>
      </form>
    </div>
  );
}
