import React from 'react';

export const SectionTitle = (props: { title: string }) => {
  return (
    <div className="relative">
      <h1 className="md:text-3xl text-xl relative z-10 font-semibold">
        {props.title}
      </h1>

      {/* /An svg goes here */}
      {/* <TitleBorder className="absolute top-[45%]" /> */}
    </div>
  );
};
