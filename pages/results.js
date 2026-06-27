import dynamic from "next/dynamic";

// Render the entire results page client-side only.
// This avoids SSR issues on Netlify and keeps router.query available.
const ResultsPage = dynamic(() => import("../components/ResultsPage"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "16px",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          border: "4px solid #6366f1",
          borderTopColor: "transparent",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <p style={{ color: "#64748b", fontWeight: 500 }}>
        Analysing your options…
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  ),
});

export default function Results() {
  return <ResultsPage />;
}
