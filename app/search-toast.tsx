"use client";

type SearchToastProps = {
  message: string;
};

export default function SearchToast({ message }: SearchToastProps) {
  return (
    <div className="search-toast" role="status" aria-live="polite">
      {message}
    </div>
  );
}
