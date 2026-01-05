'use client';

import { navItems } from '@/configs/constants';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import React, { useState } from 'react';
import { LuAlignLeft, LuChevronDown } from 'react-icons/lu';
import { BaseHeader } from './Header';

export const HeaderBottom = () => {
  const [show, setShow] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  // Track the scroll position to toggle sticky state
  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) setIsSticky(true);
      else setIsSticky(false);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div
      className={cn(
        'w-full ',
        isSticky
          ? 'fixed top-0 left-0 z-100 bg-background border-b transition-all duration-300 ease-[cubic-bezier(0.6,0.3,0.2,1)]'
          : 'relative',
      )}
    >
      <div
        className={cn(
          'container flex items-center py-0 justify-between relative',
          isSticky ? 'h-20' : '',
        )}
      >
        {/* All dropdowns */}

        <div
          className={`w-full max-w-65 ${isSticky ? '-mb-2' : ''} cursor-pointer text-white flex items-center justify-between px-5 h-12.5 bg-color1`}
          onClick={() => setShow((prev) => !prev)}
        >
          <div className="flex items-center gap-2">
            <LuAlignLeft />
            <span className="text-white font-medium">All Departments</span>
          </div>

          <LuChevronDown />
        </div>

        {/* Drop down menu */}
        {show && (
          <div
            className={`absolute left-0 ${isSticky ? 'top-17.5' : 'top-12.5'} w-full max-w-65 max-h-90 py-4 bg-popover shadow-md border z-50`}
          >
            <ul className="flex flex-col">
              <li className="px-5 py-3 hover:bg-gray-100 cursor-pointer">
                Electronics
              </li>
              <li className="px-5 py-3 hover:bg-gray-100 cursor-pointer">
                Fashion
              </li>
              <li className="px-5 py-3 hover:bg-gray-100 cursor-pointer">
                Home & Garden
              </li>
              <li className="px-5 py-3 hover:bg-gray-100 cursor-pointer">
                Sports
              </li>
              <li className="px-5 py-3 hover:bg-gray-100 cursor-pointer">
                Toys
              </li>
            </ul>
          </div>
        )}

        {/* Navigation links */}
        <div className="flex items-center">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-5 font-medium font-roboto"
            >
              {item.title}
            </Link>
          ))}
        </div>

        {isSticky && <BaseHeader />}
      </div>
    </div>
  );
};
