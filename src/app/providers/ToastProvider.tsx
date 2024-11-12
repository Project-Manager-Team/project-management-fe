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
          --toastify-font-family: inherit;
          --toastify-toast-min-height: 48px;
          --toastify-toast-max-height: 64px;
        }

        .Toastify__toast-container {
          width: fit-content !important;
          max-width: min(90vw, 320px) !important;
          padding: 0 !important;
        }

        .Toastify__toast {
          padding: 6px 10px;
          font-size: 0.813rem;
          border-radius: 6px;
          min-height: var(--toastify-toast-min-height);
          max-height: var(--toastify-toast-max-height);
          margin-bottom: 0.5rem;
        }

        /* Adjust position on mobile */
        @media only screen and (max-width: 480px) {
          .Toastify__toast-container {
            left: 50% !important;
            transform: translateX(-50%);
            margin: 0.5rem auto !important;
          }
          
          .Toastify__toast {
            margin: 0 auto 0.5rem;
          }
        }

        .Toastify__toast-body {
          padding: 0;
          margin: 0;
        }

        .Toastify__toast-icon {
          width: 18px;
          height: 18px;
          margin-right: 8px;
        }

        .Toastify__toast-icon svg {
          fill: currentColor;
          width: 18px;
          height: 18px;
        }
      `}</style>
      <ToastContainer
        position="top-center"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        limit={3}
        closeButton={false}
      />
    </>
  );
};

export default ToastProvider;
