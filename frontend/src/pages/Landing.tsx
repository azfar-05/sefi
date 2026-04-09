import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  const scrollToFeatures = () => {
    const el = document.getElementById("features");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        {/* LOGO */}
        <button
          onClick={() => navigate("/")}
          className="text-xl font-semibold tracking-tight hover:opacity-80 transition"
        >
          SEFI
        </button>

        {/* NAV CTA */}
        <button
          onClick={() => navigate("/dashboard")}
          className="text-sm border border-white/20 px-4 py-2 rounded-md hover:bg-white/10 transition"
        >
          Explore
        </button>
      </nav>

      {/* HERO SECTION */}
      <section className="relative px-8 py-28 max-w-6xl mx-auto">
        {/* Background Glow */}
        <div className="absolute inset-0 -z-10 flex justify-center">
          <div className="w-[600px] h-[600px] bg-purple-500/40 blur-[120px] rounded-full" />
        </div>

        {/* Heading */}
        <h2 className="text-5xl md:text-7xl font-semibold leading-tight tracking-tight">
          Understand Failures.
          <br />
          <span className="text-white/70">Prevent Them Early.</span>
        </h2>

        {/* Subtext */}
        <p className="mt-6 text-white/60 text-lg max-w-2xl">
          SEFI helps engineering teams identify risky commits, flaky tests, and
          failure patterns using structured data and intelligent analysis.
        </p>

        {/* CTA */}
        <div className="mt-10 flex gap-4">
          {/* PRIMARY */}
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-white text-black px-6 py-3 rounded-md font-medium hover:bg-white/90 transition"
          >
            Explore Dashboard
          </button>

          {/* SECONDARY */}
          <button
            onClick={scrollToFeatures}
            className="border border-white/20 px-6 py-3 rounded-md hover:bg-white/10 transition"
          >
            Learn More
          </button>
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        className="px-8 pb-24 max-w-6xl mx-auto scroll-mt-24"
      >
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition">
            <h3 className="text-lg font-semibold">Failure Trends</h3>
            <p className="mt-2 text-sm text-white/60">
              Track CI failures over time and identify patterns in build
              instability.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition">
            <h3 className="text-lg font-semibold">Flaky Tests</h3>
            <p className="mt-2 text-sm text-white/60">
              Detect inconsistent tests and measure reliability across multiple
              runs.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition">
            <h3 className="text-lg font-semibold">Regression Commits</h3>
            <p className="mt-2 text-sm text-white/60">
              Identify commits that introduced failures using historical CI
              data.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition">
            <h3 className="text-lg font-semibold">File Risk Analysis</h3>
            <p className="mt-2 text-sm text-white/60">
              Highlight failure-prone files based on commit and test history.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition">
            <h3 className="text-lg font-semibold">MTTR Insights</h3>
            <p className="mt-2 text-sm text-white/60">
              Measure mean time to resolution for bugs and incidents.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition">
            <h3 className="text-lg font-semibold">Commit Chain Analysis</h3>
            <p className="mt-2 text-sm text-white/60">
              Explore commit ancestry using recursive queries to trace failure
              origins.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}