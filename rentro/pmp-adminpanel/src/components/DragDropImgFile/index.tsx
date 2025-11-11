import { useRef, useState } from 'react';
import assets from '@/assets/images';
import { allowedFileTypes } from '@/utils/constants';

type DragDropFileProps = {
  setFile: (file: File | null) => void;
  setImg: (url: string | null) => void;
  customWidth?: string;
  setIsNotify?: (msg: string) => void;
  /** ✅ If true, allow ONLY one image file (no PDFs/Docs/Excel; no multi) */
  singleImage?: boolean;
};

function DragDropFile({
  setFile,
  setImg,
  customWidth,
  setIsNotify,
  singleImage = false,
}: DragDropFileProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const IMAGE_ACCEPT = 'image/*,.jpg,.jpeg,.png,.webp';
  const ALL_ACCEPT = 'image/*,.jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx';

  const acceptAttr = singleImage ? IMAGE_ACCEPT : ALL_ACCEPT;

  const isAllowed = (file: File) => {
    if (singleImage) return file.type.startsWith('image/');
    return allowedFileTypes.includes(file.type);
  };

  const processFile = (file?: File | null) => {
    if (!file) return;
    if (!isAllowed(file)) {
      setIsNotify?.(
        singleImage
          ? 'Only image files (JPG, JPEG, PNG, WEBP) are allowed'
          : 'Only image, PDF, Word, and Excel files are allowed'
      );
      return;
    }

    setFile(file);

    // Preview only for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setImg(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImg(null);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const dropped = e.dataTransfer.files?.[0]; // ✅ single file
    processFile(dropped);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const uploaded = e.target.files?.[0]; // ✅ single file
    processFile(uploaded);
    // reset input so same file can be selected again if needed
    e.currentTarget.value = '';
  };

  const onButtonClick = () => inputRef.current?.click();

  return (
    <div className={`flex ${customWidth || 'w-[400px]'} items-center justify-start`}>
      <input
        className="hidden"
        accept={acceptAttr}
        ref={inputRef}
        type="file"
        multiple={!singleImage}             
        onChange={handleChange}
      />

      <div
        className={`border-dashed border-0 flex items-center justify-center cursor-pointer w-[290px] h-[200px] ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onClick={onButtonClick}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-full h-[35px]">
            <img
              src={assets.images.skelImg}
              alt="icon"
              className="w-full h-full object-contain"
            />
            <span className="text-scrollbar font-semiBold text-sm">Click to upload</span>
            <span className="font-semiBold"> or drag and drop</span>
            <p className="text-xs mt-[2px]">
              {singleImage
                ? 'Images should be in JPG, JPEG, PNG, or WEBP'
                : 'Images/PDF/Word/Excel allowed'}
            </p>
          </div>
        </div>
      </div>

      {dragActive && (
        <div
          className="absolute inset-0"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        />
      )}
    </div>
  );
}

export default DragDropFile;
