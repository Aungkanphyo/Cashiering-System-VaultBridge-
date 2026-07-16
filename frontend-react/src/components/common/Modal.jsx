import { useEffect } from "react";

const Modal = ({ isOpen, onClose, children, maxWidth = "max-w-xl" }) => {
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/5 backdrop-blur-[7px]" />

      <div
        className={`relative z-10 w-full ${maxWidth} max-h-[90vh] overflow-y-auto rounded-2xl`}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;