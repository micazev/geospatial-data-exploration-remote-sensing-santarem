export default function Header() {
  return (
    <header className="bg-slate-800 text-white px-6 py-3 flex items-center justify-between shadow-md">
      <h1 className="text-lg font-semibold tracking-wide">
        Santarem - Land Cover Analysis
      </h1>
      <span className="text-xs text-slate-400">
        Landsat (2002-2021) &middot; Sentinel-2 (2016-2022)
      </span>
    </header>
  );
}
