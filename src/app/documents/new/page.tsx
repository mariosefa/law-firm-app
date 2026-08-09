"use client";

import { useState } from "react";
import Link from "next/link";
import { CircleCheckBig, Upload } from "lucide-react";
import { MOCK_DOCUMENT_CATEGORIES, MOCK_MATTER_NAMES } from "@/lib/mock-data";

const INPUT_CLASSES =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 transition-colors duration-150 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";

export default function UploadDocumentPage() {
  const [submitted, setSubmitted] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  if (submitted) {
    return (
      <div className="mx-auto w-full max-w-xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-zinc-200/80 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <CircleCheckBig
            size={36}
            className="mx-auto text-green-600 dark:text-green-400"
          />
          <h1 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            {fileName ?? "Document"} uploaded
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            This is a mock submission — nothing was saved. Document storage
            isn&apos;t wired to Supabase yet.
          </p>
          <Link
            href="/documents"
            className="mt-6 inline-flex items-center justify-center rounded-md bg-brand px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-hover"
          >
            Back to Documents
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
        Upload Document
      </h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
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
              if (dropped) setFileName(dropped.name);
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
              id="file"
              type="file"
              required
              className="sr-only"
              onChange={(e) => {
                const picked = e.target.files?.[0];
                if (picked) setFileName(picked.name);
              }}
            />
          </label>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="matter"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Matter
          </label>
          <select
            id="matter"
            required
            defaultValue=""
            className={INPUT_CLASSES}
          >
            <option value="" disabled>
              Select a matter
            </option>
            {MOCK_MATTER_NAMES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
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
            required
            defaultValue=""
            className={INPUT_CLASSES}
          >
            <option value="" disabled>
              Select a category
            </option>
            {MOCK_DOCUMENT_CATEGORIES.map((category) => (
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
