import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex justify-center items-center py-16 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-sans font-light text-gray-800">Join Kataba</h1>
          <p className="text-sm text-gray-600 mt-2">Create your account to get started</p>
        </div>
        <SignUp 
          appearance={{
            elements: {
              formButtonPrimary: 
                "bg-teal-500 hover:bg-teal-600 text-sm normal-case",
              card: "rounded-md shadow-sm border border-gray-200",
              headerTitle: "text-gray-800 font-light",
              headerSubtitle: "text-gray-600 text-sm",
              socialButtonsBlockButton: "border-gray-300 text-gray-700",
            }
          }}
          routing="path"
          path="/sign-up"
        />
      </div>
    </div>
  );
} 