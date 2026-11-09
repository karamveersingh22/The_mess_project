import Link from "next/link";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--bg-base)' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-50 backdrop-blur-md"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--bg-surface) 92%, transparent)',
          borderBottom: '1px solid var(--border-default)',
        }}
      >
        <div className="container mx-auto flex h-14 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black text-white"
              style={{ background: 'linear-gradient(135deg, #0D1E4C, #26415E)' }}
            >M</div>
            <span className="text-base font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>MessBook</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login" className="hidden sm:block px-3 py-1.5 text-sm font-medium rounded-lg transition-colors" style={{ color: 'var(--text-secondary)' }}>
              Login
            </Link>
            <Link href="/register" className="px-4 py-1.5 text-sm font-semibold rounded-lg text-white" style={{ background: 'linear-gradient(135deg, #0D1E4C, #26415E)' }}>
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{ background: 'radial-gradient(ellipse at top left, #83A6CE, transparent 60%), radial-gradient(ellipse at bottom right, #C48CB3, transparent 60%)' }}
          />
          <div className="container mx-auto px-4 md:px-6 py-20 md:py-28 text-center relative">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-6"
              style={{ background: 'var(--info-bg)', color: 'var(--info-text)', border: '1px solid var(--info-border)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              Digital Meal Management System
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6" style={{ color: 'var(--text-primary)' }}>
              Smart Mess<br />
              <span style={{ background: 'linear-gradient(135deg, #0D1E4C, #83A6CE)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Meal Booking
              </span>
            </h1>
            <p className="mx-auto max-w-xl text-base md:text-lg mb-10" style={{ color: 'var(--text-secondary)' }}>
              Book your weekly meals online, pay at the mess office, and collect your digital coupons. No queues. No paper. Just your phone.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link
                href="/register"
                className="px-7 py-3 rounded-xl text-sm font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #0D1E4C, #26415E)', boxShadow: '0 8px 24px rgba(13,30,76,0.3)' }}
              >
                Register as Student
              </Link>
              <Link
                href="/login"
                className="px-7 py-3 rounded-xl text-sm font-bold transition-transform hover:scale-105 active:scale-95"
                style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border-default)', color: 'var(--text-primary)' }}
              >
                Sign In →
              </Link>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-16" style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border-default)' }}>
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>How It Works</h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Three simple steps to get your digital meal passes</p>
            </div>
            <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
              {[
                { step: "01", icon: "📋", title: "Browse & Select", desc: "Pick your breakfast, lunch, and dinner for each day of the week. Live pricing shown.", color: '#83A6CE' },
                { step: "02", icon: "💵", title: "Pay at the Counter", desc: "Visit the mess office and pay the total amount in cash. No online payment needed.", color: '#C48CB3' },
                { step: "03", icon: "🎫", title: "Get Digital Coupons", desc: "Admin verifies payment and your 5-digit meal codes are generated instantly.", color: '#0D1E4C' },
              ].map((item) => (
                <div
                  key={item.step}
                  className="relative p-6 rounded-2xl"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-muted)' }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: `${item.color}20`, border: `1px solid ${item.color}40` }}
                    >{item.icon}</div>
                    <div>
                      <span className="text-[10px] font-black tracking-widest" style={{ color: 'var(--text-muted)' }}>STEP {item.step}</span>
                      <h3 className="text-sm font-bold mt-0.5 mb-1" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer
        className="py-6"
        style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border-default)' }}
      >
        <div className="container mx-auto px-4 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} MessBook — Smart Mess Booking &amp; Coupon System
        </div>
      </footer>
    </div>
  );
}
