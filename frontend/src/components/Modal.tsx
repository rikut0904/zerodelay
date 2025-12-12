"use client";

type ModalProps = {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
};

export default function Modal({ title, children, onClose }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div 
        className="w-full max-w-md rounded-2xl p-6 shadow-2xl"
        style={{ backgroundColor: "var(--color-bg-card)" , color: "var(--color-text)" ,
        }}
        >
        <h2 className="mb-4 text-xl font-semibold">{title}</h2>
        <div className="space-y-2">{children}</div>
        <button
          className="mt-4 w-full rounded-lg py-2 transition"
          style={{
            backgroundColor: "var(--color-bg-section)",
            color: "var(--color-text)",
          }}
          onClick={onClose}
        >
          ✖ 閉じる
        </button>
      </div>
    </div>
  );
}