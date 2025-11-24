import Header from "../components/Header";
import Footer from "../components/Footer";

export default function MainLayout({ children }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
      width: "100%"
    }}>
      <Header />
      <main style={{ flexGrow: 1, width: "100%" }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
