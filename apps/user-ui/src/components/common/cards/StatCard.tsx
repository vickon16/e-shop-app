import React from 'react';

type Props = {
  title: string;
  count: number;
  icon: React.ElementType;
};

export const StatCard = (props: Props) => {
  const { title, count, icon: Icon } = props;

  return (
    <div className="bg-white p-5 rounded-md shadow-sm border border-gray-100 flex items-center justify-between">
      <div className="space-y-2">
        <h3 className="text-sm text-gray-500">{title}</h3>
        <p className="text-2xl font-bold text-gray-700">{count}</p>
      </div>

      <Icon className="size-10 text-blue-500" />
    </div>
  );
};
