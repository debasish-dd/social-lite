"use client";

import {
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
  upload,
} from "@imagekit/next";
import { useRef, useState } from "react";

type UploadResult = {
  url?: string;
  name?: string;
};

export default function ImageUploader() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [preview, setPreview] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [result, setResult] = useState<UploadResult | null>(null);

  const authenticator = async () => {
    const res = await fetch("/api/imagekit-auth", {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch auth params");
    }

    return res.json();
  };

  const validateFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      throw new Error("Only image files are allowed.");
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Max file size is 5MB.");
    }
  };

  const setSelectedFilePreview = (file: File) => {
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const getFile = () => {
    const input = fileInputRef.current;

    if (!input?.files || input.files.length === 0) {
      throw new Error("Please choose a file.");
    }

    return input.files[0];
  };

  const resetMessages = () => {
    setError("");
    setMessage("");
  };

  const handleUpload = async () => {
    try {
      resetMessages();
      setResult(null);

      const file = getFile();
      validateFile(file);

      setSelectedFilePreview(file);

      setUploading(true);
      setProgress(0);

      const auth = await authenticator();

      abortControllerRef.current = new AbortController();

      const response = await upload({
        file,
        fileName: `${Date.now()}-${file.name}`,
        token: auth.token,
        expire: auth.expire,
        signature: auth.signature,
        publicKey: auth.publicKey,
        abortSignal: abortControllerRef.current.signal,
        onProgress: (event) => {
          const value = Math.round((event.loaded / event.total) * 100);
          setProgress(value);
        },
      });

      setResult({
        url: response.url,
        name: response.name,
      });

      setMessage("Upload completed successfully.");
    } catch (err: any) {
      if (err instanceof ImageKitAbortError) {
        setError("Upload cancelled.");
      } else if (err instanceof ImageKitInvalidRequestError) {
        setError(err.message);
      } else if (err instanceof ImageKitUploadNetworkError) {
        setError("Network error during upload.");
      } else if (err instanceof ImageKitServerError) {
        setError("Server error from ImageKit.");
      } else {
        setError(err.message || "Upload failed.");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleAbort = () => {
    abortControllerRef.current?.abort();
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (!file || !fileInputRef.current) return;

    const dt = new DataTransfer();
    dt.items.add(file);
    fileInputRef.current.files = dt.files;

    setSelectedFilePreview(file);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl rounded-3xl border border-zinc-800 bg-zinc-900 shadow-2xl p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Image Upload</h1>
          <p className="text-zinc-400 mt-2">
            Fast upload with ImageKit + modern UI.
          </p>
        </div>

        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`block rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition ${
            dragActive
              ? "border-blue-500 bg-blue-500/10"
              : "border-zinc-700 hover:border-zinc-500"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setSelectedFilePreview(file);
            }}
          />

          <p className="text-lg font-semibold">Drop image here</p>
          <p className="text-zinc-400 mt-1">or click to browse</p>
          <p className="text-xs text-zinc-500 mt-3">PNG / JPG / WEBP • Max 5MB</p>
        </label>

        {preview && (
          <div className="rounded-2xl overflow-hidden border border-zinc-800">
            <img
              src={preview}
              alt="preview"
              className="w-full h-72 object-cover"
            />
          </div>
        )}

        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-zinc-300">
              <span>Uploading...</span>
              <span>{progress}%</span>
            </div>

            <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {message && (
          <div className="rounded-xl bg-green-500/10 border border-green-500/30 p-3 text-green-300">
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-red-300">
            {error}
          </div>
        )}

        {result?.url && (
          <div className="rounded-2xl border border-zinc-800 p-4 space-y-3">
            <p className="font-semibold">Uploaded File</p>

            <img
              src={result.url}
              alt="uploaded"
              className="w-full h-64 object-cover rounded-xl"
            />

            <a
              href={result.url}
              target="_blank"
              className="inline-block text-blue-400 hover:underline break-all"
            >
              {result.url}
            </a>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="flex-1 rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>

          <button
            onClick={handleAbort}
            disabled={!uploading}
            className="rounded-xl bg-zinc-800 px-5 py-3 font-semibold hover:bg-zinc-700 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}