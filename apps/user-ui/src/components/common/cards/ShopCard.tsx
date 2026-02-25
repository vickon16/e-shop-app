import { Button } from '@/components/ui/button';
import { TShopWithRelations } from '@e-shop-app/packages/types';
import Image from 'next/image';
import { LuArrowUpRight, LuMapPin } from 'react-icons/lu';
import { Ratings } from '../Ratings';

type Props = {
  shop: Pick<
    TShopWithRelations,
    | 'id'
    | 'name'
    | 'ratings'
    | 'coverBanner'
    | 'address'
    | 'category'
    | 'avatar'
  >;
};

export const ShopCard = (props: Props) => {
  const { shop } = props;

  return (
    <div className="w-full rounded-md cursor-pointer bg-white border border-gray-200 shadow-sm overflow-hidden transition">
      {/* Cover */}
      <div className="h-[120px] w-full relative">
        <Image
          src={shop?.coverBanner || '/default-image.jpg'}
          alt={shop?.name || 'Shop'}
          fill
          className="object-cover"
        />
      </div>

      {/* Avatar */}
      <div className="relative flex justify-center -mt-8">
        <div className="size-16 rounded-full border-4 border-white overflow-hidden shadow-md bg-white relative">
          <Image
            src={shop?.avatar?.fileUrl || '/default-avatar.jpg'}
            alt={shop?.name || 'Shop'}
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Info  */}
      <div className="px-4 pb-4 pt-2 text-center">
        <h3 className="font-semibold text-gray-800">{shop?.name || 'Shop'}</h3>
        <p className="text-xs text-gray-500 mt-0.5">0 Followers</p>

        {/* Address */}

        <div className="flex items-center justify-center text-xs text-gray-500 mt-2 flex-wrap gap-4">
          {shop?.address && (
            <span className="flex items-center gap-1 max-w-[90%]">
              <LuMapPin className="size-4 shrink-0" />
              <span className="truncate">{shop.address}</span>
            </span>
          )}

          <Ratings rating={shop?.ratings || 2} />
        </div>

        {shop?.category && (
          <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs">
            <span className="bg-blue-50 capitalize text-blue-600 px-2 py-0.5 rounded-md">
              {shop.category}
            </span>
          </div>
        )}

        <Button size="xs" className="w-full mt-4">
          Visit Shop <LuArrowUpRight />
        </Button>
      </div>
    </div>
  );
};
