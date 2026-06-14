"use client";

import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    const hr = new Date().getHours();
    if (hr >= 5 && hr < 12) {
      setGreeting("Good morning");
    } else if (hr >= 12 && hr < 18) {
      setGreeting("Good afternoon");
    } else if (hr >= 18 && hr < 21) {
      setGreeting("Good evening");
    } else {
      setGreeting("Night owl mode 🦉");
    }
  }, []);

  const handleLogin = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="w-full max-w-md bg-customSurface rounded-card border border-customBorder overflow-hidden shadow-sm">
      {/* Orange accent top strip */}
      <div className="h-2 w-full bg-accent" />
      
      <div className="p-8 flex flex-col items-center text-center">
        {/* App Logo Emblem */}
        <div className="h-12 w-12 rounded-element bg-accent flex items-center justify-center text-white font-bold text-2xl mb-6 shadow-sm">
          M
        </div>

        {/* Time-aware Greeting */}
        <h2 className="text-2xl font-bold text-textPrimary tracking-tight mb-2">
          {greeting === "Night owl mode 🦉" ? greeting : `${greeting}, Manuu`}
        </h2>
        
        <p className="text-sm text-textSecondary mb-8 font-medium">
          Your day is waiting.
        </p>

        {/* Google Login Button */}
        <button
          onClick={handleLogin}
          className="flex items-center justify-center gap-3 w-full py-3 px-4 bg-white border border-customBorder rounded-element text-sm font-semibold text-textPrimary hover:bg-customBg hover:border-textSecondary/30 transition-all shadow-sm"
        >
          {/* Google Color SVG Icon */}
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.579-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.258-3.133C18.29 1.709 15.573 1 12.24 1c-6.077 0-11 4.923-11 11s4.923 11 11 11c6.346 0 10.56-4.463 10.56-10.74 0-.72-.077-1.27-.172-1.975H12.24Z"
            />
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  );
}
