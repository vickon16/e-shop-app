import React from 'react';

type Props = {
  title: string;
  description: string;
  icon: React.ElementType;
  onClick?: () => void;
};

export const QuickActionCard = (props: Props) => {
  const { title, description, icon: Icon, onClick } = props;

  return (
    <div
      className="bg-white p-4 cursor-pointer rounded-md shadow-sm border border-gray-100 flex items-start gap-4"
      onClick={onClick}
    >
      <Icon className="size-6 text-blue-500 mt-1" />
      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-1">{title}</h3>
        <p className="text-xs text-gray-600">{description}</p>
      </div>
    </div>
  );
};
