import Image from 'next/image';
import React, { useState } from 'react';
import { LuPencil, LuWandSparkles, LuX } from 'react-icons/lu';

type Props = {
  size: string;
  isSmall?: boolean;
  onImageChange: (file: File | null, index: number) => void;
  onRemove?: (index: number) => void;
  defaultImage?: string | null;
  setOpenImageModal: (openImageModal: boolean) => void;
  index?: number;
};

export const ImagePlaceholder = (props: Props) => {
  const {
    defaultImage,
    onImageChange,
    index = 0,
    isSmall,
    onRemove,
    setOpenImageModal,
    size,
  } = props;
  const [imagePreview, setImagePreview] = useState<string | null>(
    defaultImage ?? null,
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        onImageChange(file, index);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
      onImageChange(null, index);
    }
  };

  return (
    <div
      className={`relative ${isSmall ? 'h-[180px]' : 'h-[450px]'} w-full cursor-pointer bg-[#1e1e1e] border border-gray-600 rounded-lg flex flex-col justify-center items-center`}
    >
      <input
        type="file"
        accept="image/*"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        id={`image-upload-${index}`}
        onChange={handleFileChange}
      />

      {imagePreview ? (
        <>
          <button
            type="button"
            onClick={() => onRemove?.(index)}
            className="absolute top-3 right-3 p-2 rounded bg-red-600 shadow-lg"
          >
            <LuX size={16} />
          </button>
          <button
            type="button"
            onClick={() => setOpenImageModal(true)}
            className="absolute top-3 right-[70px] p-2 rounded bg-blue-500 shadow-lg cursor-pointer"
          >
            <LuWandSparkles size={16} />
          </button>
          {/* <img
            src={imagePreview}
            alt="Preview"
            className="w-full h-full object-cover rounded-lg"
          /> */}

          <Image
            src={imagePreview}
            alt="uploaded"
            width={400}
            height={300}
            className="w-full h-full object-cover rounded-lg"
          />
        </>
      ) : (
        <>
          <label
            className="absolute top-3 right-3 p-2 rounded bg-slate-700 shadow-lg cursor-pointer"
            htmlFor={`image-upload-${index}`}
          >
            <LuPencil size={16} />
          </label>

          <p
            className={`text-gray-400 ${isSmall ? 'text-xl' : 'text-4xl'} font-semibold`}
          >
            {size}
          </p>

          <p
            className={`text-gray-500 ${isSmall ? 'text-sm' : 'text-lg'} mt-2 text-center`}
          >
            Please choose an image <br /> according to the expected ratio
          </p>
        </>
      )}
    </div>
  );
};
