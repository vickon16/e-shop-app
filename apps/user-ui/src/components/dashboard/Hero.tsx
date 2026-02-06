'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import { Button } from '../ui/button';
import Image from 'next/image';
import { LuMoveRight } from 'react-icons/lu';

export const Hero = () => {
  const router = useRouter();

  return (
    <div className="bg-[#115061] h-[85vh] flex flex-col justify-center w-full">
      <div className="md:w-[80%] w-[90%] m-auto md:flex h-full items-center">
        <div className="md:w-1/2">
          <p className="font-roboto font-normal text-white pb-2 text-xl">
            Starting from 40$
          </p>

          <h1 className="text-white text-6xl font-extrabold font-roboto">
            The best watch <br /> Collection 2025
          </h1>
          <p className="font-oregano text-3xl pt-4 text-white">
            Exclusive offer <span className="text-yellow-400">10%</span> off
            this week
          </p>
          <br />
          <Button
            onClick={() => router.push('/products')}
            variant="outlineBackground"
            className="w-[140px] h-[40px]!"
          >
            Shop Now <LuMoveRight />
          </Button>
        </div>

        <div className="md:w-1/2 flex justify-center">
          <Image
            src="https://ik.imagekit.io/fzoxzwtey/products/slider-img-1.png"
            alt="image"
            width={450}
            height={450}
          />
        </div>
      </div>
    </div>
  );
};
