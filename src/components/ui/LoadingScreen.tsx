export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div style={{ fontSize: 48 }} className="animate-pulse-neon">🎮</div>
      <p className="text-sm text-muted">로딩 중...</p>
    </div>
  );
}
