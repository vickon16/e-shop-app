import React from 'react';
import { Button } from '@/components/ui/button';
import { FcGoogle } from 'react-icons/fc';

export const GoogleButton = () => {
  return (
    <div className="w-full flex items-center justify-center my-3">
      <Button className="w-fit px-6!" variant="outline" rounded="full">
        <FcGoogle className="mr-1.5 size-5!" />
        Continue with Google
      </Button>
    </div>
  );
};
