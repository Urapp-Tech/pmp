import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

/** ---------- tiny helpers ---------- */
const isImageSrc = (src?: string) =>
  !!src && (/^data:image\//.test(src) || /\.(png|jpe?g|webp|gif)$/i.test(src));

const fileKind = (name?: string, type?: string) => {
  if (type === 'application/pdf' || /\.pdf$/i.test(name ?? '')) return 'pdf';
  if (
    /msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document/.test(
      type ?? ''
    ) ||
    /\.(doc|docx)$/i.test(name ?? '')
  )
    return 'word';
  if (type === 'text/xml' || /\.xml$/i.test(name ?? '')) return 'xml';
  return 'other';
};

const FileIcon = ({ kind }: { kind: 'pdf' | 'word' | 'xml' | 'other' }) => {
  const base = 'h-10 w-10';
  if (kind === 'pdf')
    return (
      <svg viewBox="0 0 24 24" className={cn(base, 'text-red-500')}>
        <path
          fill="currentColor"
          d="M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm8 1.5V8h4.5L14 3.5ZM7 13h3.2c1.1 0 1.8.7 1.8 1.7s-.7 1.8-1.8 1.8H8.5V18H7v-5Zm1.5 1.2v1.1h1.5c.4 0 .6-.2.6-.6s-.2-.5-.6-.5H8.5Zm6.1-1.2h1.5V18h-1.5v-1.9h-1.5V18H12v-5h1.1v1.9h1.5V13Z"
        />
      </svg>
    );
  if (kind === 'word')
    return (
      <svg viewBox="0 0 24 24" className={cn(base, 'text-blue-500')}>
        <path
          fill="currentColor"
          d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Zm5 6h-5V3.98Z"
        />
        <path
          fill="currentColor"
          d="M7.5 10h1.6l.9 3.4L11 10h1.6l-1.6 5H9.6L8.8 12.7 8 15H6.7Z"
        />
      </svg>
    );
  if (kind === 'xml')
    return (
      <svg viewBox="0 0 24 24" className={cn(base, 'text-amber-500')}>
        <path
          fill="currentColor"
          d="M8.6 16.6 3.9 12l4.7-4.6L10 8.8 6.9 12 10 15.2Zm6.8 0-1.4-1.4L17.1 12 14 8.8l1.4-1.4L20.1 12Z"
        />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" className={cn(base, 'text-gray-400')}>
      <path
        fill="currentColor"
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Zm5 6h-5V3.98Z"
      />
    </svg>
  );
};

/** ---------- component ---------- */
type UploadDocProps = {
  /** existing url/base64 to show */
  value?: string | null;
  /** called when user picks a file; you store file/src in your state */
  onChange?: (file: File, src: string) => void;
  /** clear preview */
  onRemove?: () => void;
  /** accept attribute for input */
  accept?: string;
  /** optional label text inside the empty box */
  label?: React.ReactNode;
  note?: React.ReactNode;
  className?: string;
};

export default function UploadDoc({
  value,
  onChange,
  onRemove,
  accept = 'image/*,.pdf,.doc,.docx,.xml',
  label = (
    <>
      <span className="font-semibold">Click to upload</span>{' '}
      <span className="text-primary-bg/60">or drag and drop</span>
    </>
  ),
  note = (
    <span className="text-xs text-primary-bg/50">
      Images should be in JPG, JPEG, or PNG format
    </span>
  ),
  className,
}: UploadDocProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | undefined>(undefined);
  const [fileType, setFileType] = useState<string | undefined>(undefined);

  const openPicker = () => inputRef.current?.click();

  const handleFiles = async (files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result ?? '');
      setFileName(f.name);
      setFileType(f.type);
      onChange?.(f, src);
    };
    reader.readAsDataURL(f);
  };

  const handleDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const hasValue = !!value;

  return (
    <div
      className={cn(
        'relative w-full rounded-xl',
        hasValue
          ? 'border-2 border-scrollbar p-3'
          : 'border-2 border-dashed border-scrollbar',
        className
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      {/* hidden input */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {!hasValue ? (
        <button
          type="button"
          onClick={openPicker}
          className={cn(
            'grid w-full place-items-center rounded-xl bg-bodyTable/60 p-8 transition',
            dragOver && 'ring-2 ring-primary/40'
          )}
        >
          <div className="grid place-items-center gap-3">
            {/* placeholder image icon */}
            <svg viewBox="0 0 24 24" className="h-14 w-14 text-primary/25">
              <path
                fill="currentColor"
                d="M19 3H5a2 2 0 0 0-2 2v14l4-4h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm-7 8l-2 2l-3-4l-3 4V5h16v8H9Z"
              />
            </svg>
            <div className="text-sm text-primary-bg">{label}</div>
            <div>{note}</div>
          </div>
        </button>
      ) : (
        <div className="relative flex items-center justify-center p-2">
          {/* remove */}
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-primary-bg text-white shadow hover:opacity-90"
              aria-label="Remove"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* preview */}
          {isImageSrc(value) ? (
            <img
              src={value as string}
              alt="uploaded"
              className="max-h-[160px] max-w-[260px] rounded-md object-contain"
            />
          ) : (
            <div className="flex items-center gap-3">
              <FileIcon kind={fileKind(fileName, fileType)} />
              <div className="max-w-[260px] truncate text-sm text-primary-bg/80">
                {fileName ?? String(value).split('/').pop()}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
