import { CheckCircle, XCircle } from "lucide-react";

const Toast = ({ message, type = "success" }) => {
  if (!message) return null;

  const isError = type === "error";

  return (
    <div
     className={`fixed top-6 left-1/2 -translate-x-1/3 z-[60] flex items-center p-4 text-sm rounded-lg border shadow-lg ${
        isError
          ? "text-rose-800 bg-rose-100 border-rose-300"
          : "text-emerald-800 bg-emerald-100 border-emerald-300"
      }`}
    >
      {isError ? (
        <XCircle className="w-5 h-5 mr-2 text-rose-600" />
      ) : (
        <CheckCircle className="w-5 h-5 mr-2 text-emerald-600" />
      )}
      <span className="font-medium">{message}</span>
    </div>
  );
};

export default Toast;
