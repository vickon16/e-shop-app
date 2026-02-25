import React from 'react';

type Props = {
  title: string;
  children: React.ReactNode;
};

export const SidebarMenu = (props: Props) => {
  const { title, children } = props;

  return (
    <div className="block">
      <h3 className="text-xs tracking-[0.04rem] pl-1 border-b border-b-muted-foreground/20 pb-1">
        {title}
      </h3>
      {children}
    </div>
  );
};
