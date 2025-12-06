import React from "react";
import axios from "axios";

//firebase
import { auth, provider } from "./Config";
import { signInWithPopup } from "firebase/auth";

import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      navigate("/home");

      await axios.post(`${API_URL}/api/saveUser`, {
        withCredentials: true,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        id: user.uid,
        name: user.displayName,
        email: user.email,
        photo: user.photoURL,
      });

      console.log("User Info: ", user.displayName, user.email, user.photoURL);
    } catch (error) {
      console.error("Error during sign-in: ", error);
    }
  };

  return (
    <div className="fh-full w-full bg-white flex flex-col items-center justify-center overflow-hidden font-sans text-[#1d1d1f] antialiased selection:bg-gray-200 relative">
      {/* --- MAIN CONTENT --- */}
      {/* Folosim flex-col și gap pentru a distribui spațiul elegant */}
      {/* LOGO - Responsive: mai mic pe mobil (w-32), mai mare pe desktop (md:w-48) */}
      <div className="mb-1 md:mb-6 flex flex-col items-center animate-fade-in">
        <img
          src="https://i.ibb.co/wN0BBfDG/logo.png"
          alt="BunkerFinder Logo"
          className="w-32 h-32 md:w-48 md:h-48 object-contain drop-shadow-sm"
        />
      </div>

      {/* TEXTE - Titluri responsive */}
      <div className="text-center mb-10 md:mb-14 space-y-3">
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-[#1d1d1f] leading-tight">
          Holla, Welcome to <br className="hidden md:block" />{" "}
          <span className="font-bold">BunkerFinder</span>
        </h1>
        <p className="text-[#86868b] text-base md:text-l font-normal leading-relaxed max-w-xs md:max-w-md mx-auto">
          Access the secure bunker database
          <br /> with your Google account.
        </p>
      </div>

      {/* BUTON GOOGLE */}
      <button
        onClick={handleLogin}
        className="group w-full md:w-auto md:min-w-[340px] flex items-center justify-center gap-3 bg-white border border-[#d2d2d7] text-[#1d1d1f] text-lg font-medium rounded-full px-6 py-3.5 hover:bg-[#f5f5f7] hover:border-[#b5b5b5] hover:shadow-sm transition-all duration-200 active:scale-[0.98]"
      >
        <svg
          className="w-6 h-6 shrink-0"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M47.532 24.5528C47.532 22.9214 47.3997 21.2811 47.1175 19.6761H24.48V28.9181H37.4434C36.9055 31.8988 35.177 34.5356 32.6461 36.2111V42.2078H40.3801C44.9217 38.0278 47.532 31.8547 47.532 24.5528Z"
            fill="#4285F4"
          />
          <path
            d="M24.48 48.0016C30.9529 48.0016 36.4116 45.8764 40.3888 42.2078L32.6549 36.2111C30.5031 37.675 27.7252 38.5039 24.4888 38.5039C18.2256 38.5039 12.9145 34.2489 11.0112 28.5212H3.03296V34.6912C6.99066 42.5412 15.1438 48.0016 24.48 48.0016Z"
            fill="#34A853"
          />
          <path
            d="M11.0051 28.5211C10.4934 26.9926 10.2111 25.3697 10.2111 23.6923C10.2111 22.0148 10.4934 20.392 11.0051 18.8635V12.6935H3.03296C1.41066 15.9084 0.499512 19.6912 0.499512 23.6923C0.499512 27.6934 1.41066 31.4762 3.03296 34.6911L11.0051 28.5211Z"
            fill="#FBBC05"
          />
          <path
            d="M24.48 8.8597C28.0076 8.8597 31.1469 10.0768 33.6267 12.4466L40.5299 5.54341C36.3939 1.69125 30.9353 0 24.48 0C15.1438 0 6.99066 5.4604 3.03296 13.3104L11.0051 19.4804C12.9145 13.7527 18.2256 8.8597 24.48 8.8597Z"
            fill="#EA4335"
          />
        </svg>
        <span>Sign in with Google</span>
      </button>
      <button className="w-full p-4 md:w-auto md:min-w-[340px] flex items-center justify-center text-[#86868b] ">
        Continue as Guest
      </button>

      {/* DIVIZOR */}
      <div className="w-full md:w-[340px] my-8 flex items-center justify-center gap-3 opacity-60">
        <div className="flex-1 h-px bg-gray-300"></div>
        <span className="text-[10px] md:text-[11px] text-[#86868b] uppercase tracking-widest font-semibold whitespace-nowrap">
          Secure Encrypted Login
        </span>
        <div className="flex-1 h-px bg-gray-300"></div>
      </div>
      {/* COPYRIGHT - Poziționat absolut jos, independent de fluxul principal */}
      <footer className="bottom-0 w-full text-center py-4">
        <p className="text-[#86868b] text-[10px] md:text-xs font-medium">
          © 2025 BunkerFinder Inc. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Login;
