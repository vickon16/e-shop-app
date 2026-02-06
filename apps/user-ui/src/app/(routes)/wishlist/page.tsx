'use client';

import { getUserOptions } from '@/actions/queries/base-queries';
import { Routes } from '@/configs/routes';
import { useDeviceInfo } from '@/hooks/use-device-tracking';
import { useLocationTracking } from '@/hooks/use-location-tracking';
import { useAppStore } from '@/store';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import React from 'react';
import { LuChevronRight, LuPlus } from 'react-icons/lu';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { BiTrash } from 'react-icons/bi';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const tableHeadings = ['Product', 'Price', 'Quantity', 'Action'];

const WishlistPage = () => {
  const { location } = useLocationTracking();
  const { deviceInfo } = useDeviceInfo();

  const userQuery = useQuery(getUserOptions());
  const currentUser = userQuery?.data;

  const store = useAppStore((state) => state);
  const { wishlist, removeFromWishList, cart, addToCart } = store;

  return (
    <div className="w-full bg-background">
      <div className="md:w-[80%] w-[95%] py-6 mx-auto min-h-screen">
        {/* Bread crumbs */}
        <h2 className="text-2xl py-2 font-semibold font-poppins">WishList</h2>

        <div className="flex items-center">
          <Link href={Routes.home} className="text-primary cursor-pointer">
            Home
          </Link>
          <LuChevronRight size={20} className="opacity-[.8]" />
          <span>WishList</span>
        </div>

        {/* If wishlist is empty */}
        {wishlist.length === 0 || !currentUser ? (
          <div className="flex flex-col items-center justify-center border min-h-[200px] gap-4 mt-10">
            <h3 className="text-base font-poppins text-muted-foreground">
              Your wishlist is empty!. Start adding products
            </h3>
            <Link href={Routes.home} className="text-primary cursor-pointer">
              Go to Home
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-10 mt-10">
            {/* Wishlist table */}{' '}
            <Table className="border">
              <TableHeader>
                <TableRow>
                  {tableHeadings.map((heading) => (
                    <TableHead className="bg-muted" key={heading}>
                      {heading}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {wishlist.map((item) => {
                  const isInCart = cart.some((c) => c.id === item.id);
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium flex items-center gap-4 text-lg">
                        <Image
                          src={item.images[0].fileUrl}
                          alt={item.title}
                          width={50}
                          height={50}
                          className="size-[50px] rounded-lg object-cover"
                        />
                        {item.title}
                      </TableCell>
                      <TableCell>${item.salePrice}</TableCell>
                      <TableCell>{item.quantity ?? 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant={'primary2Dark'}
                            disabled={isInCart}
                            onClick={() =>
                              addToCart({
                                location,
                                deviceInfo,
                                user: currentUser,
                                product: item,
                              })
                            }
                          >
                            <LuPlus size={18} /> Add to cart
                          </Button>
                          <Button
                            variant={'outlineDestructive'}
                            onClick={() =>
                              removeFromWishList({
                                location,
                                deviceInfo,
                                user: currentUser,
                                id: item.id,
                              })
                            }
                          >
                            <BiTrash size={18} /> Remove from wishlist
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
