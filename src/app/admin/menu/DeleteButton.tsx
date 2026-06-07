"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteItemAction } from "./actions";

export function DeleteButton({ id, name }: { id: string; name: string }) {
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (!confirm(`'${name}'을 삭제하시겠습니까?`)) return;
    setPending(true);
    const fd = new FormData();
    fd.set("id", id);
    await deleteItemAction(fd);
    setPending(false);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="inline-flex items-center justify-center w-7 h-7 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 disabled:opacity-40"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  );
}
