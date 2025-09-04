import Image from 'next/image';

export default function Header() {
  return (
    <header style={{ backgroundColor: '#003273' }}>
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <div>
          <Image 
            src="/logo-250824.png" 
            alt="Logo" 
            width={150}
            height={96}
            style={{ height: '6rem', width: 'auto' }}
            priority
          />
        </div>
        {/* <nav className="text-sm opacity-80">今治・しまなみ海道で働く場所を見つける</nav> */}
      </div>
    </header>
  );
}
