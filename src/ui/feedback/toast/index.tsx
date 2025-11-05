import { ToastContainer, toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const ToastProvider = () => (
    <ToastContainer
        position="bottom-right"
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

export const useToast = () => {
    return {
        success: (msg: string) => toast.success(msg),
        error: (msg: string) => toast.error(msg),
        warning: (msg: string) => toast.warning(msg),
        info: (msg: string) => toast.info(msg),
        message: (msg: string) => toast(msg)
    };
};