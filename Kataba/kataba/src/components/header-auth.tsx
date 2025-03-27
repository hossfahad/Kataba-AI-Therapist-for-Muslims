'use client';

import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";

export function HeaderAuth() {
  const { isSignedIn } = useAuth();
  
  return (
    <div className="flex items-center ml-4 md:ml-6 space-x-4">
      {!isSignedIn ? (
        <>
          <SignInButton mode="modal">
            <button className="text-sm text-gray-700 hover:text-teal-500 transition-colors duration-300">Sign In</button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="text-sm bg-teal-500 hover:bg-teal-600 text-white py-1 px-3 rounded-md transition-colors duration-300">Sign Up</button>
          </SignUpButton>
        </>
      ) : (
        <UserButton afterSignOutUrl="/" />
      )}
    </div>
  );
} 