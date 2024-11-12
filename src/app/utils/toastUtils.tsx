
import { toast } from 'react-toastify';

export const showConfirmationToast = (
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
) => {
  const ToastContent = (
    <div>
      <p>{message}</p>
      <div className="mt-2 flex justify-end gap-2">
        <button
          onClick={() => {
            toast.dismiss();
            onConfirm();
          }}
          className="px-2 py-1 bg-red-500 text-white rounded"
        >
          Xóa
        </button>
        <button
          onClick={() => {
            toast.dismiss();
            if (onCancel) onCancel();
          }}
          className="px-2 py-1 bg-gray-500 text-white rounded"
        >
          Hủy
        </button>
      </div>
    </div>
  );

  toast(ToastContent, {
    autoClose: false,
    closeButton: false,
  });
};