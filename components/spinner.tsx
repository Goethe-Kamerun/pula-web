"use client";

import { Loader2 } from "lucide-react";

export default function Spinner({
  loading,
  content,
  extraClass,
}: {
  loading: boolean;
  content?: string;
  extraClass?: string;
}) {
  return (
    <>
      {content && <span>{content}</span>}
      {loading && (
        <Loader2
          className={`ml-4 h-6 w-6 animate-spin ${extraClass}`}
          style={{ color: "#72777d", bottom: "3px", position: "relative" }}
        />
      )}
    </>
  );
}
