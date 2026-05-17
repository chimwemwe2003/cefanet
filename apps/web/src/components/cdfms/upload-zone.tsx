"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, ImagePlus, CheckCircle2, AlertTriangle, Loader2, X } from "lucide-react";
import { compressImage, formatBytes, type CompressedImage } from "@/lib/cdfms/image-compress";
import { getFirebaseStorage, isStorageConfigured } from "@/lib/cdfms/firebase";

export interface UploadedItem {
  id: string;
  name: string;
  dataUrl: string;
  url: string | null; // Firebase download URL, or null in demo mode
  width: number;
  height: number;
  compressedBytes: number;
  originalBytes: number;
  storage: "firebase" | "demo";
}

type Phase = "idle" | "compressing" | "uploading" | "done" | "error";

interface FileState {
  id: string;
  name: string;
  phase: Phase;
  progress: number; // 0-100
  error?: string;
  result?: UploadedItem;
}

export function UploadZone({
  pathPrefix = "evidence",
  onUploaded,
}: {
  pathPrefix?: string;
  onUploaded?: (item: UploadedItem) => void;
}) {
  const [files, setFiles] = useState<FileState[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const live = isStorageConfigured();

  const handleFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      const picked = Array.from(fileList).slice(0, 6); // cap per batch

      for (const file of picked) {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        setFiles((prev) => [
          ...prev,
          { id, name: file.name, phase: "compressing", progress: 0 },
        ]);

        try {
          // 1. Compress
          const compressed: CompressedImage = await compressImage(file, 800, 0.8);

          // 2. Upload
          setFiles((prev) =>
            prev.map((f) => (f.id === id ? { ...f, phase: "uploading", progress: 5 } : f))
          );

          let url: string | null = null;
          let storage: "firebase" | "demo" = "demo";

          if (live) {
            // Real upload to Firebase Storage with progress events
            const fb = getFirebaseStorage();
            if (fb) {
              const { ref, uploadBytesResumable, getDownloadURL } = await import(
                "firebase/storage"
              );
              const objectRef = ref(fb, `${pathPrefix}/${id}.jpg`);
              const task = uploadBytesResumable(objectRef, compressed.blob, {
                contentType: "image/jpeg",
              });
              await new Promise<void>((resolve, reject) => {
                task.on(
                  "state_changed",
                  (snap) => {
                    const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
                    setFiles((prev) =>
                      prev.map((f) => (f.id === id ? { ...f, progress: Math.max(5, pct) } : f))
                    );
                  },
                  (err) => reject(err),
                  () => resolve()
                );
              });
              url = await getDownloadURL(objectRef);
              storage = "firebase";
            }
          } else {
            // Demo mode — simulate upload progress
            for (let p = 10; p <= 100; p += 18) {
              await new Promise((r) => setTimeout(r, 90));
              setFiles((prev) =>
                prev.map((f) => (f.id === id ? { ...f, progress: Math.min(100, p) } : f))
              );
            }
          }

          const result: UploadedItem = {
            id,
            name: file.name,
            dataUrl: compressed.dataUrl,
            url,
            width: compressed.width,
            height: compressed.height,
            compressedBytes: compressed.compressedBytes,
            originalBytes: compressed.originalBytes,
            storage,
          };

          setFiles((prev) =>
            prev.map((f) =>
              f.id === id ? { ...f, phase: "done", progress: 100, result } : f
            )
          );
          onUploaded?.(result);
        } catch (err) {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === id
                ? {
                    ...f,
                    phase: "error",
                    error: err instanceof Error ? err.message : "Upload failed. Please try again.",
                  }
                : f
            )
          );
        }
      }
    },
    [live, pathPrefix, onUploaded]
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Dropzone */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`w-full rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
          dragOver
            ? "border-ministry-500 bg-ministry-50"
            : "border-ink-200 hover:border-ministry-300 hover:bg-ink-50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="h-12 w-12 rounded-xl bg-ministry-50 text-ministry-700 flex items-center justify-center mx-auto">
          <ImagePlus className="h-6 w-6" />
        </div>
        <div className="font-semibold text-ink-900 mt-2">Upload project photo evidence</div>
        <div className="text-xs text-ink-500 mt-0.5">
          Tap to choose, or drag images here. Photos are compressed to ~800px before upload.
        </div>
        <div className="text-[10px] text-ink-400 mt-2">
          {live ? (
            <span className="inline-flex items-center gap-1 text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Firebase Storage connected
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-amber-700">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Demo mode — preview only, not stored
            </span>
          )}
        </div>
      </button>

      {/* Upload list */}
      {files.length > 0 ? (
        <div className="space-y-2">
          {files.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-3 rounded-lg border border-ink-200 bg-white p-2.5"
            >
              {/* Thumbnail */}
              <div className="h-12 w-12 rounded-md bg-ink-100 overflow-hidden flex-shrink-0">
                {f.result ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={f.result.dataUrl} alt={f.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Upload className="h-4 w-4 text-ink-400" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-ink-900 truncate">{f.name}</div>
                {f.phase === "error" ? (
                  <div className="text-xs text-red-600 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> {f.error}
                  </div>
                ) : f.phase === "done" && f.result ? (
                  <div className="text-xs text-ink-500">
                    {f.result.width}×{f.result.height} ·{" "}
                    {formatBytes(f.result.originalBytes)} → {formatBytes(f.result.compressedBytes)}{" "}
                    <span className="text-emerald-700 font-medium">
                      ({Math.round((1 - f.result.compressedBytes / f.result.originalBytes) * 100)}% smaller)
                    </span>
                  </div>
                ) : (
                  <div className="mt-1.5 h-1.5 w-full rounded-full bg-ink-100 overflow-hidden">
                    <div
                      className="h-full bg-ministry-600 rounded-full transition-all"
                      style={{ width: `${f.progress}%` }}
                    />
                  </div>
                )}
              </div>

              <div className="flex-shrink-0">
                {f.phase === "compressing" || f.phase === "uploading" ? (
                  <span className="inline-flex items-center gap-1 text-xs text-ministry-700">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    {f.phase === "compressing" ? "Compressing" : `${f.progress}%`}
                  </span>
                ) : f.phase === "done" ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                ) : f.phase === "error" ? (
                  <button
                    onClick={() => setFiles((prev) => prev.filter((x) => x.id !== f.id))}
                    className="text-ink-400 hover:text-ink-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
