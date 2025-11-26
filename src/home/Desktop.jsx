import React from 'react';
import { useNavigate } from 'react-router-dom';

const desktopItems = [
  {
    icon: '📦',
    title: 'Goods List',
    description: 'View and manage the list of goods.',
    buttonText: 'View Goods',
    navigateTo: '/goods',
  },
  {
    icon: '➕',
    title: 'Add New Good',
    description: 'Create a new good in the system.',
    buttonText: 'Add Good',
    navigateTo: '/goods/new',
  },  
];

export default function Desktop() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <h2>Manage you Goods</h2>
      <p>Choose what you want to view.</p>
      <div style={styles.grid}>
        {desktopItems.map(({ icon, title, description, buttonText, navigateTo }, idx) => (
          <div key={idx} style={styles.card}>
            <div style={styles.icon}>{icon}</div>
            <h3>{title}</h3>
            <p style={styles.description}>{description}</p>
            <button
              style={styles.button}
              onClick={() => navigate(navigateTo)}
            >
              {buttonText}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    textAlign: 'center',
    padding: '40px 20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  grid: {
    display: 'flex',
    justifyContent: 'center',
    gap: '30px',
    marginTop: '30px',
    flexWrap: 'wrap',
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: '14px',
    padding: '30px 25px',
    width: '280px',
    boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  icon: {
    fontSize: '48px',
    marginBottom: '12px',
  },
  description: {
    color: '#666',
    marginBottom: '22px',
    fontSize: '14px',
    lineHeight: '1.4',
  },
  button: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '12px 28px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
  },
};
