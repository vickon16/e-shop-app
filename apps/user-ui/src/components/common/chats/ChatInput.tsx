import { PickerProps } from 'emoji-picker-react';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import { LuImage, LuSend, LuSmile } from 'react-icons/lu';

type Props = {
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  onSendMessage: (e: any) => void;
};

const EmojiPicker = dynamic(
  () =>
    import('emoji-picker-react').then(
      (mod) => mod.default as React.FC<PickerProps>,
    ),
  { ssr: false },
);

export const ChatInput = ({ message, setMessage, onSendMessage }: Props) => {
  const [showEmoji, setShowEmoji] = useState(false);

  const handleEmojiClick = (emojiData: any) => {
    setMessage((prev) => prev + emojiData.emoji);
    setShowEmoji(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('Uploading image', file.name);
    }
  };

  return (
    <form
      onSubmit={onSendMessage}
      className="border-t border-t-gray-200 bg-white px-4 py-3 flex items-center gap-2 relative"
    >
      <label className="cursor-pointer p-2 hover:bg-gray-100 rounded-md">
        <LuImage className="size-5 text-gray-600" />

        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          hidden
        />
      </label>

      <div className="relative">
        <button
          type="button"
          onClick={() => setShowEmoji((prev) => !prev)}
          className="p-2 hover:bg-gray-100 rounded-md"
        >
          <LuSmile className="size-5 text-gray-500" />
        </button>

        {showEmoji && (
          <div className="absolute bottom-12 left-0 z-50">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}
      </div>

      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className="flex-1 px-4 py-2 text-sm border outline-none border-gray-200 rounded-md"
      />

      <button type="submit" className="p-2 hover:bg-gray-100 rounded-md">
        <LuSend className="size-5 text-gray-500" />
      </button>
    </form>
  );
};
