'use client';

import {
  useBaseMutation,
  useDeleteProductImageMutation,
} from '@/actions/mutations/base.mutation';
import CustomModal from '@/components/common/CustomModal';
import { ImagePlaceholder } from '@/components/common/ImagePlaceholder';
import { errorToast } from '@/lib/utils';
import { TUploadProductImageResponseSchema } from '@e-shop-app/packages/zod-schemas';
import { useState } from 'react';
import { toast } from 'sonner';
import { EditImageModal } from './EditImageModal';

const MAX_IMAGES = 8;

type Props = {
  images: (TUploadProductImageResponseSchema | null)[];
  onUpdateImages: (
    updatedImages: (TUploadProductImageResponseSchema | null)[],
  ) => void;
};

export const ProductImages = (props: Props) => {
  const { images, onUpdateImages } = props;
  const [selectedImage, setSelectedImage] =
    useState<TUploadProductImageResponseSchema | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const sendImageToServerMutation = useBaseMutation<
    FormData,
    TUploadProductImageResponseSchema
  >({
    endpoint: '/product/upload-product-image',
  });

  const deleteProductImageMutation = useDeleteProductImageMutation();

  const handleImageChange = async (file: File | null, index: number) => {
    if (!file) {
      toast.error('No file selected');
      return;
    }

    setActiveImageIndex(index);

    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await sendImageToServerMutation.mutateAsync(formData);

      if (response.data) {
        toast.success('Image uploaded successfully');

        const updatedImages = [...images];
        updatedImages[index] = response.data;

        if (
          index === updatedImages.length - 1 &&
          updatedImages.length < MAX_IMAGES &&
          !!file
        ) {
          console.log('Adding placeholder');
          // we cannot add more than MAX_IMAGES
          updatedImages.push(null);
        }

        onUpdateImages(updatedImages);
      }
    } catch (error) {
      console.log('Error processing image:', error);
      errorToast(error, 'Failed to process the selected image.');
    } finally {
      setActiveImageIndex(null);
    }
  };

  const handleRemoveImage = async (index: number) => {
    try {
      // Convert file to base64
      const updatedImages = [...images];
      const imageToDelete = updatedImages[index];

      if (!imageToDelete) {
        toast.error('No image to delete');
        return;
      }

      setActiveImageIndex(index);

      // Delete picture
      await deleteProductImageMutation.mutateAsync({
        fileId: imageToDelete.fileId,
      });

      updatedImages.splice(index, 1);

      // Add null placeholder
      if (!updatedImages.includes(null) && updatedImages.length < MAX_IMAGES) {
        updatedImages.push(null);
      }

      onUpdateImages(updatedImages);
      toast.success('Image removed successfully');
    } catch (error) {
      console.log('Error processing image:', error);
      errorToast(error, 'Failed to process the selected image.');
    } finally {
      setActiveImageIndex(null);
    }
  };

  const isUploadingImage = sendImageToServerMutation.isPending;
  const isRemovingImage = deleteProductImageMutation.isPending;
  const isLoading = isUploadingImage || isRemovingImage;

  return (
    <>
      <ImagePlaceholder
        index={0}
        defaultImage={images[0]?.fileUrl ?? undefined}
        size="765 x 850"
        onImageChange={handleImageChange}
        onRemove={handleRemoveImage}
        onEdit={() => setSelectedImage(images[0])}
        isLoading={isLoading && activeImageIndex === 0}
      />

      <div className="grid grid-cols-2 gap-3 mt-4">
        {images.slice(1).map((image, index) => {
          return (
            <ImagePlaceholder
              key={index}
              index={index + 1}
              defaultImage={image?.fileUrl ?? undefined}
              size="150 x 150"
              isSmall
              onImageChange={handleImageChange}
              onRemove={handleRemoveImage}
              onEdit={() => setSelectedImage(image)}
              isLoading={isLoading && activeImageIndex === index + 1}
            />
          );
        })}
      </div>

      {!!selectedImage && (
        <CustomModal
          open={!!selectedImage}
          onOpenChange={() => setSelectedImage(null)}
          classNames={{
            content: 'dark',
          }}
        >
          <EditImageModal
            selectedImage={selectedImage}
            onTransform={(transformedImage) => {
              setSelectedImage(transformedImage);
            }}
          />
        </CustomModal>
      )}
    </>
  );
};
