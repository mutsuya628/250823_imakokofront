export default function Header() {
  return (
    <header style={{ backgroundColor: '#003273' }}>
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <div>
          <img src="/ロゴ_250824.png" alt="ロゴ" style={{ height: '6rem' }} />
        </div>
        {/* <nav className="text-sm opacity-80">今治・しまなみ海道で働く場所を見つける</nav> */}
      </div>
    </header>
  );
}
