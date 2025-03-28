'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export const PrivacyPolicyDialog = () => {
  const lastUpdated = "August 2023";
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-xs text-gray-600 hover:text-teal-500 transition-colors duration-300">
          Privacy Policy
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl bg-white">
        <DialogHeader>
          <DialogTitle>Privacy Policy</DialogTitle>
          <DialogDescription>Last updated: {lastUpdated}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] mt-4 pr-4">
          <div className="space-y-6 text-sm">
            <p className="text-gray-700">
              Your privacy is our top priority at Kataba. This Privacy Policy outlines how we handle your data to ensure a safe and confidential experience.
            </p>
            
            <div className="space-y-2">
              <h3 className="font-medium text-gray-800">1. What We Collect</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-600">
                <li>When you create an account, we collect your email for authentication.</li>
                <li>Your conversations are <strong>not stored permanently</strong> unless you choose to save them.</li>
                <li>We do not track or analyze personal data for external use.</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium text-gray-800">2. How We Use Your Data</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-600">
                <li>Your data is used <strong>only</strong> to provide a seamless user experience (e.g., allowing you to continue a conversation where you left off).</li>
                <li>We <strong>never</strong> train AI models on your conversations or share data with third parties.</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium text-gray-800">3. Your Control Over Your Data</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-600">
                <li>You can delete your chat history and account anytime.</li>
                <li>We do not retain personal information beyond what is necessary for account management.</li>
                <li>To delete your data completely, simply contact us at <a href="mailto:hello@withkataba.com" className="text-teal-600 hover:text-teal-700">hello@withkataba.com</a>. We respect your privacy and give you full control over your information.</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium text-gray-800">4. Security Measures</h3>
              <p className="text-gray-600">
                We use <strong>end-to-end encryption</strong> and secure cloud storage to keep your conversations safe.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium text-gray-800">5. Changes to This Policy</h3>
              <p className="text-gray-600">
                We may update this policy to improve security and transparency. You'll be notified of any major changes.
              </p>
            </div>
            
            <p className="text-gray-700">
              If you have questions, reach out to <span className="text-teal-600">hello@withkataba.com</span>.
            </p>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export const TermsOfServiceDialog = () => {
  const lastUpdated = "August 2023";
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-xs text-gray-600 hover:text-teal-500 transition-colors duration-300">
          Terms of Service
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl bg-white">
        <DialogHeader>
          <DialogTitle>Terms of Service</DialogTitle>
          <DialogDescription>Last updated: {lastUpdated}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] mt-4 pr-4">
          <div className="space-y-6 text-sm">
            <p className="text-gray-700">
              Welcome to Kataba! By using our services, you agree to the following terms:
            </p>
            
            <div className="space-y-2">
              <h3 className="font-medium text-gray-800">1. Purpose of Kataba</h3>
              <p className="text-gray-600">
                Kataba is an AI-powered therapeutic companion designed for reflection and support. It is <strong>not</strong> a licensed medical or religious authority.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium text-gray-800">2. User Responsibilities</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-600">
                <li>You must be <strong>13 years or older</strong> to use Kataba.</li>
                <li>Do not use Kataba for <strong>emergency mental health situations</strong>—please contact a professional.</li>
                <li>Any misuse of the platform, including spamming or harmful intent, may result in account suspension.</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium text-gray-800">3. Privacy & Security</h3>
              <ul className="list-disc pl-6 space-y-1 text-gray-600">
                <li>Your conversations are private and will not be shared or used for AI training.</li>
                <li>You have full control over your data and can delete it at any time.</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium text-gray-800">4. Limitation of Liability</h3>
              <p className="text-gray-600">
                Kataba is provided "as is" without guarantees of uninterrupted service. We are <strong>not liable</strong> for decisions made based on AI-generated responses.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium text-gray-800">5. Account Termination</h3>
              <p className="text-gray-600">
                We reserve the right to suspend or terminate accounts that violate these terms.
              </p>
            </div>
            
            <p className="text-gray-700">
              By continuing to use Kataba, you acknowledge these terms. For questions, contact <span className="text-teal-600">hello@withkataba.com</span>.
            </p>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}; 