export default function Footer() {
  return (
    <footer className="bg-[#0d1117] border-t border-[#21262d] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center text-white text-xs font-bold">
              HN
            </div>
            <span className="text-[#8b949e] text-sm">
              TechHub — Your personal tech news dashboard
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#484f58]">
            <span>Powered by Hacker News API</span>
            <span>•</span>
            <span>Built with Next.js + Prisma</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
