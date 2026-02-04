export default function Loading() {
  return (
    <div className="min-h-screen bg-paper text-ink flex items-center justify-center">
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        {/* Logo */}
        <div className="relative">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-teal to-teal-600 flex items-center justify-center shadow-lg animate-pulse-soft">
            <span className="font-serif text-2xl font-bold text-white">E</span>
          </div>
          <div className="absolute -inset-2 rounded-3xl bg-teal/10 blur-xl animate-pulse-soft" />
        </div>

        {/* Loading indicator */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-2 w-2 rounded-full bg-teal animate-pulse-soft"
                style={{ animationDelay: `${i * 200}ms` }}
              />
            ))}
          </div>
          <p className="text-sm text-inkMuted">Loading your workspace...</p>
        </div>
      </div>
    </div>
  );
}
