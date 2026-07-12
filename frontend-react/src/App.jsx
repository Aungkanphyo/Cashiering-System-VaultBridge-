import { BrowserRouter } from "react-router-dom";
import "./index.css";
import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        containerClassName="mt-10"
        reverseOrder={false}
        toastOptions={{
          className: "font-medium text-sm rounded-xl border border-gray-100 shadow-xl px-4 py-3 bg-white text-gray-800 tracking-wide",
          duration: 4000,
          success: {
            className: "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold",
            iconTheme: {
              primary: "#10b981",
              secondary: "#ffffff",
            },
          },
          error: {
            className: "border-red-500 bg-red-50 text-red-900 font-bold",
            iconTheme: {
              primary: "#ef4444",
              secondary: "#ffffff",
            },
          },
        }}
      />
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
