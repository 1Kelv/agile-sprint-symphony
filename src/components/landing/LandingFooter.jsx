
import React from "react";

const LandingFooter = () => {
  return (
    <footer className="py-12 border-t">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="bg-gradient-to-tr from-agile-primary to-agile-secondary rounded-lg p-2 mr-2">
              <span className="text-white font-bold">AF</span>
            </div>
            <span className="font-bold">AgileFlow</span>
          </div>
          <div className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} AgileFlow. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
