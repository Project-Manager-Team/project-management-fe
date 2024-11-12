"use client";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ToastProvider = () => {
  return (
    <>
      <style jsx global>{`
        :root {
          --toastify-color-light: var(--background);
          --toastify-color-dark: var(--background);
          --toastify-color-info: rgb(var(--info));
          --toastify-color-success: rgb(var(--success));
          --toastify-color-warning: rgb(var(--warning)); 
          --toastify-color-error: rgb(var(--destructive));
          --toastify-text-color-light: var(--foreground);
          --toastify-text-color-dark: var(--foreground);
          --toastify-icon-color-success: rgb(var(--success));
          --toastify-icon-color-error: rgb(var(--destructive));
        }

        .Toastify__toast-icon svg {
          fill: currentColor;
        }

        .Toastify__close-button {
          color: var(--foreground);
          opacity: 0.7;
        }

        .Toastify__close-button:hover {
          opacity: 1;
        }
      `}</style>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  );
};

export default ToastProvider;
