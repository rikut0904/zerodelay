"use client";

type ModalProps = {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
};

export default function Modal({ title, children, onClose }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="mb-4 text-xl font-semibold">{title}</h2>
        <div className="space-y-2">{children}</div>
        <button
          className="mt-4 w-full rounded-lg bg-gray-600 py-2 text-white transition hover:bg-gray-500"
          onClick={onClose}
        >
          ✖ 閉じる
        </button>
      </div>
    </div>
  );
}
