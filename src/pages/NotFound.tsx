import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import Layout from "@/components/Layout";
import { FileQuestion, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <Layout>
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white/60 backdrop-blur-md rounded-3xl border border-gray-100 p-8 sm:p-12 text-center shadow-lg shadow-gray-100/50">
          <div className="w-24 h-24 bg-indigo-50 text-indigo-300 rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-12 shadow-inner">
            <FileQuestion className="w-12 h-12 -rotate-12" />
          </div>
          <h1 className="text-6xl font-black text-gray-900 mb-4 tracking-tighter">404</h1>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Page Not Found</h2>
          <p className="text-gray-500 mb-10 text-lg leading-relaxed">
            Oops! The page you are looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="outline" className="h-12 px-6 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 font-medium">
              <button onClick={() => window.history.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
              </button>
            </Button>
            <Button asChild className="h-12 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 font-medium">
              <Link to="/">
                <Home className="w-4 h-4 mr-2" /> Home Page
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
