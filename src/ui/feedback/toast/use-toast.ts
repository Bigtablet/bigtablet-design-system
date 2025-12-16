"use client";

import { toast } from "react-toastify";

export const useToast = (containerId: string = "default") => {
  const base = { containerId };

  return {
    success: (msg: string) => toast.success(msg, base),
    error: (msg: string) => toast.error(msg, base),
    warning: (msg: string) => toast.warning(msg, base),
    info: (msg: string) => toast.info(msg, base),
    message: (msg: string) => toast(msg, base),
  };
};