"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import {
  ALLOWED_FILE_TYPES_LABEL,
  DOCUMENT_CATEGORIES,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_LABEL,
  formatFileSize,
  isAllowedFileExtension,
} from "@/lib/documents";
import type { MatterRef } from "@/utils/supabase/types";
import { createDocument } from "../actions";

const INPUT_CLASSES =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 transition-colors duration-150 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";

export default function UploadDocumentForm({
  matters,
}: {
  matters: MatterRef[];
}) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag-and-drop doesn't populate <input type="file"> on its own — sync
  // the file into the input's FileList so it's included when the form
  // submits to the server action. Used for both the drop and browse
  // paths so validation stays in one place.
  function handleFile(file: File) {
    if (!isAllowedFileExtension(file.name)) {
      setFileError(
        `"${file.name}" isn't a supported file type. Allowed: ${ALLOWED_FILE_TYPES_LABEL}.`
      );
      setFileName(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFileError(
        `"${file.name}" is ${formatFileSize(file.size)}, which is over the ${MAX_FILE_SIZE_LABEL} limit.`
      );
      setFileName(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setFileError(null);
    setFileName(file.name);

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    if (fileInputRef.current) {
      fileInputRef.current.files = dataTransfer.files;
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
        Upload Document
      </h1>
      <form
        action={createDocument}
        className="space-y-6 rounded-xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            File
          </label>
          <label
            htmlFor="file"
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              const dropped = e.dataTransfer.files?.[0];
              if (dropped) handleFile(dropped);
            }}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-6 py-10 text-center transition-colors duration-150 ${
              dragActive
                ? "border-brand bg-brand/5"
                : "border-zinc-300 hover:border-brand dark:border-zinc-700"
            }`}
          >
            <Upload
              size={28}
              className={dragActive ? "text-brand" : "text-zinc-400"}
            />
            {fileName ? (
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                {fileName}
              </p>
            ) : (
              <>
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Drag and drop a file here
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  or click to browse
                </p>
              </>
            )}
            <input
              ref={fileInputRef}
              id="file"
              name="file"
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
              required
              className="sr-only"
              onChange={(e) => {
                const picked = e.target.files?.[0];
                if (picked) handleFile(picked);
              }}
            />
          </label>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {ALLOWED_FILE_TYPES_LABEL} — up to {MAX_FILE_SIZE_LABEL}
          </p>
          {fileError && (
            <p className="text-xs text-red-600 dark:text-red-400">
              {fileError}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="matter_id"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Matter
          </label>
          <select
            id="matter_id"
            name="matter_id"
            required
            defaultValue=""
            className={INPUT_CLASSES}
          >
            <option value="" disabled>
              Select a matter
            </option>
            {matters.map((matter) => (
              <option key={matter.id} value={matter.id}>
                {matter.title}
              </option>
            ))}
          </select>
          {matters.length === 0 && (
            <p className="text-xs text-zinc-500">
              No matters found — add one to the matters table first.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="category"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Category
          </label>
          <select
            id="category"
            name="category"
            required
            defaultValue=""
            className={INPUT_CLASSES}
          >
            <option value="" disabled>
              Select a category
            </option>
            {DOCUMENT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-hover"
        >
          Upload
        </button>
      </form>
    </div>
  );
}
