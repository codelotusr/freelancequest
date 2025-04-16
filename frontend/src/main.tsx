import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { DarkModeProvider } from "./context/DarkModeProvider"
import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <DarkModeProvider>
          <App />
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        </DarkModeProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
