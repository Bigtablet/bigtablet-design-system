"use client";

import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export interface ToastProviderProps {
  containerId?: string;
}

export const ToastProvider = ({ containerId = "default" }: ToastProviderProps) => {
  return (
      <ToastContainer
          containerId={containerId}
          position="top-right"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          transition={Slide}
      />
  );
};