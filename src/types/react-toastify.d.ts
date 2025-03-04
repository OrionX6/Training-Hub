declare module 'react-toastify' {
  import { ComponentType, ReactNode } from 'react';

  export interface ToastContainerProps {
    position?:
      | 'top-right'
      | 'top-center'
      | 'top-left'
      | 'bottom-right'
      | 'bottom-center'
      | 'bottom-left';
    autoClose?: number | false;
    hideProgressBar?: boolean;
    newestOnTop?: boolean;
    closeOnClick?: boolean;
    rtl?: boolean;
    pauseOnFocusLoss?: boolean;
    draggable?: boolean;
    pauseOnHover?: boolean;
    theme?: 'light' | 'dark' | 'colored';
  }

  export interface ToastOptions extends Partial<ToastContainerProps> {
    type?: 'info' | 'success' | 'warning' | 'error' | 'default';
    toastId?: string | number;
    onClick?: () => void;
  }

  export const ToastContainer: ComponentType<ToastContainerProps>;

  export function toast(content: ReactNode, options?: ToastOptions): React.ReactText;
  toast.info = (content: ReactNode, options?: ToastOptions) => React.ReactText;
  toast.success = (content: ReactNode, options?: ToastOptions) => React.ReactText;
  toast.warning = (content: ReactNode, options?: ToastOptions) => React.ReactText;
  toast.error = (content: ReactNode, options?: ToastOptions) => React.ReactText;
}
