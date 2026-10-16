import { X } from "lucide-react";
import { ReactNode, useEffect, useId, useRef } from "react";
import DemoBadge from "src/view/shared/DemoBadge";

interface Props {
  title: string;
  children: ReactNode;
  onClose: () => void;
}

export default function Modal({ title, children, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    const opener = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    return () => {
      dialog?.close();
      opener?.focus();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby={titleId}
      onCancel={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-top">
        <DemoBadge />
        <button className="icon-btn" onClick={onClose} aria-label="Close dialog">
          <X />
        </button>
      </div>
      <h2 id={titleId}>{title}</h2>
      {children}
    </dialog>
  );
}
