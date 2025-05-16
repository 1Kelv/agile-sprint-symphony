
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="flex flex-col items-center">
          <div className="rounded-full bg-red-900/20 border border-red-600 p-3 text-red-500">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h1 className="text-6xl font-bold text-blue-500 mt-6">404</h1>
          <h2 className="text-2xl font-semibold mt-2">Oops! Page not found</h2>
          <p className="text-gray-400 mt-2 max-w-sm">
            The page you are looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="flex flex-col space-y-2">
          <Button asChild variant="default" size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800">
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
