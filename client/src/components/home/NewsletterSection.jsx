import React, { useState } from "react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-3xl sm:rounded-full border border-neutral-200/80 p-6 sm:px-10 sm:py-5 flex flex-col lg:flex-row items-center justify-between shadow-sm gap-6">
        {/* Left: Title & Subtitle */}
        <div className="text-center lg:text-left shrink-0">
          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900">
            Stay in the Loop
          </h3>
          <p className="text-xs text-neutral-500 font-light mt-0.5">
            Get the latest deals, new arrivals and more.
          </p>
        </div>

        {/* Center: Email Subscription Form */}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md flex items-center bg-[#F4F4F6] rounded-full p-1 border border-neutral-200/70 focus-within:border-neutral-400 transition"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={subscribed ? "Thanks for subscribing!" : "Enter your email address"}
            disabled={subscribed}
            className="w-full bg-transparent px-4 py-2 text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none disabled:opacity-60"
            required
          />
          <button
            type="submit"
            disabled={subscribed}
            className="shrink-0 px-6 py-2.5 rounded-full bg-neutral-950 text-white text-xs font-semibold hover:bg-neutral-800 transition disabled:bg-emerald-700"
          >
            {subscribed ? "Subscribed!" : "Subscribe"}
          </button>
        </form>

        {/* Right: Round Rocket Stamp */}
        <div className="relative flex items-center justify-center shrink-0">
          <div className="w-12 h-12 rounded-full bg-[#ECE7FE] flex items-center justify-center text-[#805AD5] shadow-xs">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.5a21.5 21.5 0 016.364 4.136 21.5 21.5 0 014.136 6.364c.243.68-.344 1.34-1.014 1.157l-3.236-.883a4.5 4.5 0 00-3.69 1.042l-3.268 3.268a1.5 1.5 0 01-2.121 0l-2.122-2.121a1.5 1.5 0 010-2.122l3.268-3.268a4.5 4.5 0 001.042-3.69l-.883-3.236c-.183-.67.477-1.257 1.157-1.014A21.5 21.5 0 0112 2.5zm-1.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            </svg>
          </div>
          {/* Subtle curved text label below/around */}
          <span className="hidden sm:inline-block text-[9px] text-neutral-400 font-medium ml-2.5 italic">
            No spam, just good stuff
          </span>
        </div>
      </div>
    </section>
  );
}
