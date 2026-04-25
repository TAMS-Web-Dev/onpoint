import Link from "next/link";
import { ShieldOff } from "lucide-react";

export default function SuspendedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl border border-gray-200 shadow-sm px-8 py-10 text-center">
        <div className="flex justify-center mb-5">
          <div className="h-14 w-14 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
            <ShieldOff size={24} className="text-red-500" />
          </div>
        </div>

        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Account Suspended
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed">
          Your account has been suspended. Please contact{" "}
          <span className="font-medium text-[#2D1D44]">
            support@onpoint.community
          </span>{" "}
          for assistance.
        </p>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <Link
            href="/sign-in"
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Back to sign in
          </Link>
        </div>
      </div>

      <div className="fixed bottom-6 left-0 right-0 flex justify-center pointer-events-none select-none">
        <span className="text-xs text-gray-300 font-semibold tracking-tight">
          On<span className="text-[#FF790E]">Point</span>
        </span>
      </div>
    </div>
  );
}
