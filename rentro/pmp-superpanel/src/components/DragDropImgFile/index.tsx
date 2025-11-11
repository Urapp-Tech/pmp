import { useRef, useState } from 'react';

import assets from '@/assets/images';
import { imageAllowedTypes } from '@/utils/constants';

type DragDropFileProps = {
  setFile: any;
  setImg: any;
  customWidth?: string;
  setIsNotify?: any;
};

function DragDropFile({
  setFile,
  setImg,
  customWidth,
  setIsNotify,
}: DragDropFileProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (files: any) => {
    setFile(files[0]);
  };

  const handleDrag = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files);
    }
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const fileType = droppedFile.type;
      if (imageAllowedTypes.includes(fileType)) {
        setFile(droppedFile);
        const reader = new FileReader();
        reader.onload = () => {
          setImg(reader.result as string);
        };
        reader.readAsDataURL(droppedFile);
      } else {
        setIsNotify('Only .png, .jpg, and .jpeg files are allowed');
      }
    }
  };

  const handleChange = (e: any) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files);
    }
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      const fileType = uploadedFile.type;
      if (imageAllowedTypes.includes(fileType)) {
        const reader = new FileReader();
        reader.onload = () => {
          setImg(reader.result as string);
          // setImageUrl(reader.result as string);
        };
        reader.readAsDataURL(uploadedFile);
      } else {
        // setIsNotify(true);
        setIsNotify('Only .png, .jpg, and .jpeg files are allowed');
      }
    }
  };

  const onButtonClick = () => inputRef.current?.click();

  return (
    <div
      className={`flex ${customWidth || 'w-[400px]'} items-center justify-start`}
    >
      <input
        className="hidden"
        accept="image/*,.jpg,.jpeg,.png"
        ref={inputRef}
        type="file"
        multiple
        onChange={handleChange}
      />
      <div
        className={`p-4 border-dashed border-0 flex items-center justify-center rounded-[20px] cursor-pointer bg-earth-bg w-[180px] h-[150px] ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onClick={onButtonClick}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center text-center">
          {/* <FileImage className="" size={60} /> */}
          <div className="w-[44px] h-[44px]">
            <img
              src={assets.images.skelImg}
              alt="icon"
              className="w-full h-full object-contain"
            />
          </div>
          {/* <Button className="ml-2 hover:underline" variant="link" type="button">
            Drag & drop files
            <span className="text-sm text-gray-500">or</span>
            Browse
          </Button> */}
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
