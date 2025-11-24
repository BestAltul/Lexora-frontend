import { Button, Menu, MenuItem } from "@mui/material";
import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Header() {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <header style={{ width:"100%",backgroundColor: "#1976d2", color: "white", padding: "10px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px",width:"100%" }}>
        <h1 style={{ flexGrow: 1 }}>Lexora Home</h1>

        <Link to="/home" style={{ textDecoration: "none" }}>
          <Button variant="outlined" sx={{ color: "white", borderColor: "white" }}>
            Home
          </Button>
        </Link>

        <Link to="/login" style={{ textDecoration: "none" }}>
          <Button variant="outlined" sx={{ color: "white", borderColor: "white" }}>
            Login
          </Button>
        </Link>

        <Button
          variant="outlined"
          sx={{ color: "white", borderColor: "white" }}
          onClick={handleClick}
        >
          Menu
        </Button>

        <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
          <MenuItem onClick={handleClose}>About</MenuItem>
          <MenuItem onClick={handleClose}>Review</MenuItem>
        </Menu>
      </div>
    </header>
  );
}
