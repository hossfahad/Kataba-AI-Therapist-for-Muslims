import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex justify-center items-center py-16 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-sans font-light text-gray-800">Welcome back</h1>
          <p className="text-sm text-gray-600 mt-2">Sign in to continue to Kataba</p>
        </div>
        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: 
                "bg-pink-500 hover:bg-pink-600 text-sm normal-case",
              card: "rounded-md shadow-sm border border-gray-200",
              headerTitle: "text-gray-800 font-light",
              headerSubtitle: "text-gray-600 text-sm",
              socialButtonsBlockButton: "border-gray-300 text-gray-700",
            }
          }}
          routing="path"
          path="/sign-in"
        />
      </div>
    </div>
  );
} 