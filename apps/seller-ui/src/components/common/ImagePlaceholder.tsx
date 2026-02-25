'use client';

import { cn } from '@/lib/utils';
import React, { useEffect, useState } from 'react';
import { BiLoaderAlt } from 'react-icons/bi';
import { LuPencil, LuWandSparkles, LuX } from 'react-icons/lu';

type Props = {
  size: string;
  isSmall?: boolean;
  onImageChange: (file: File | null, index: number) => void;
  onRemove?: (index: number) => void;
  defaultImage?: string | null;
  onEdit: () => void;
  index?: number;
  isLoading?: boolean;
  className?: string;
};

export const ImagePlaceholder = (props: Props) => {
  const {
    defaultImage,
    onImageChange,
    index = 0,
    isSmall,
    onRemove,
    onEdit,
    size,
    isLoading,
    className,
  } = props;

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Handle default image (server URL)
  useEffect(() => {
    setImagePreview(defaultImage || null);
  }, [defaultImage]);

  // Cleanup object URL on unmount or change
  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      setImagePreview(null);
      onImageChange(null, index);
      return;
    }

    // Revoke previous blob URL if any
    if (imagePreview?.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    onImageChange(file, index);
  };

  return (
    <div
      className={cn(
        `relative ${isSmall ? 'h-[180px]' : 'h-[450px]'} w-full bg-[#1e1e1e] border border-gray-600 rounded-lg flex flex-col justify-center items-center`,
        className,
      )}
    >
      <input
        type="file"
        accept="image/*"
        className={`absolute inset-0 w-full h-full opacity-0 cursor-pointer ${
          imagePreview ? 'pointer-events-none' : ''
        }`}
        id={`image-upload-${index}`}
        onChange={handleFileChange}
        disabled={isLoading}
      />

      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg z-10">
          <BiLoaderAlt
            size={isSmall ? 30 : 48}
            className="animate-spin text-white"
          />
        </div>
      )}

      {imagePreview ? (
        <>
          <button
            type="button"
            onClick={() => onRemove?.(index)}
            className="absolute top-3 right-3  disabled:pointer-events-none p-2 rounded bg-red-600 shadow-lg z-20"
            disabled={isLoading}
          >
            <LuX size={16} />
          </button>

          <button
            type="button"
            onClick={onEdit}
            className="absolute top-3 right-[70px] disabled:pointer-events-none p-2 rounded bg-blue-500 shadow-lg z-20"
            disabled={isLoading}
          >
            <LuWandSparkles size={16} />
          </button>

          {/* Use normal img for blob preview */}
          <img
            src={imagePreview}
            alt="uploaded"
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
