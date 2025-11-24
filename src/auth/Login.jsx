import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  IconButton,
  InputAdornment
} from "@mui/material";

import { useState } from "react";
import { Visibility, VisibilityOff } from "@mui/icons-material";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setUserEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/v3/auth/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Success:", data);
      } else {
        alert(`error: ${data.message}`);
      }
    } catch (err) {
      console.error("Server error:", err);
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f5f5"
      }}
    >
      <Paper
        elevation={6}
        sx={{
          padding: 4,
          width: 350,
          display: "flex",
          flexDirection: "column",
          gap: 2
        }}
      >
        <Typography variant="h5" textAlign="center">
          Login
        </Typography>

        <TextField
          label="Username"          
          fullWidth
          value={email}
          onChange={(e) => setUserEmail(e.target.value)}
        />

        <TextField
          label="Password"
          type={showPassword ? "text" : "password"}
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleLogin}
        >
          Sign In
        </Button>
      </Paper>
    </Box>
  );
}
