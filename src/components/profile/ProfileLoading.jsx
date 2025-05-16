
import React from "react";
import { Loader2 } from "lucide-react";

const ProfileLoading = () => {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
};

export default ProfileLoading;
