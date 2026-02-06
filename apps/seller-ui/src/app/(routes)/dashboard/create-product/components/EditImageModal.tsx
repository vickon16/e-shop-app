import { Button } from '@/components/ui/button';
import { errorToast } from '@/lib/utils';
import { AI_ENHANCEMENT_EFFECTS } from '@e-shop-app/packages/constants';
import { TUploadProductImageResponseSchema } from '@e-shop-app/packages/zod-schemas';
import Image from 'next/image';
import React, { useRef } from 'react';
import { BiLoaderAlt } from 'react-icons/bi';
import { LuWand } from 'react-icons/lu';

type Props = {
  selectedImage: TUploadProductImageResponseSchema;
  onTransform: (transformedImage: TUploadProductImageResponseSchema) => void;
};

export const EditImageModal = (props: Props) => {
  const { selectedImage, onTransform } = props;
  const [activeEffect, setActiveEffect] = React.useState<string>('');
  const [isProcessing, setIsProcessing] = React.useState<boolean>(false);

  const applyTransformation = async (effect: string) => {
    if (!selectedImage && isProcessing) return;
    setActiveEffect(effect);
    setIsProcessing(true);

    try {
      // Parse the URL and update the 'tr' search param with the new effect
      const url = new URL(selectedImage.fileUrl);
      url.searchParams.set('tr', effect);
      const transformedUrl = url.toString();

      const transformedImage: TUploadProductImageResponseSchema = {
        fileId: selectedImage.fileId,
        fileUrl: transformedUrl,
      };

      onTransform(transformedImage);
    } catch (error) {
      errorToast(error, 'Failed to apply the transformation.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-lg font-semibold">Enhance Product Image</h2>

      <div className="relative h-[400px] w-full border-gray-600 rounded-md overflow-hidden">
        {(isProcessing || !selectedImage.fileUrl) && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg z-10">
            <BiLoaderAlt size={30} className="animate-spin text-white" />
          </div>
        )}
        <Image
          src={selectedImage.fileUrl}
          alt="Selected Product"
          fill
          className="size-full object-cover"
        />
      </div>

      <div className="space-y-2">
        <h3 className="text-white text-sm font-semibold">AI Enhancements</h3>

        <div className="grid grid-cols-2 gap-3 max-h-[250px] overflow-y-auto">
          {AI_ENHANCEMENT_EFFECTS.map((effect) => (
            <Button
              variant={activeEffect === effect.effect ? 'default' : 'outline'}
              key={effect.effect}
              onClick={() => applyTransformation(effect.effect)}
              disabled={isProcessing}
            >
              <LuWand size={18} />
              {effect.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
