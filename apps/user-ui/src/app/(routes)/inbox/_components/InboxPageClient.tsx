'use client';

import {
  getConversationsOptions,
  getMessagesInfiniteOptions,
} from '@/actions/queries/chat-queries';
import { ChatInput } from '@/components/common/chats/ChatInput';
import { useWebSocketContext } from '@/contexts/web-socket-context';
import {
  TChatIncomingMessage,
  TConversationResponse,
  TUserWithRelations,
  TWebSocketMessageEvent,
} from '@e-shop-app/packages/types';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

type Props = {
  conversationId: string;
  userData: TUserWithRelations;
};

const InboxPageClient = (props: Props) => {
  const { conversationId, userData } = props;

  const router = useRouter();
  const wsRef = useRef<WebSocket | null>(null);
  const messageContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);
  const prevScrollHeightRef = useRef(0);

  const [chats, setChats] = useState<TConversationResponse[]>([]);
  const [selectedChat, setSelectedChat] =
    useState<TConversationResponse | null>(null);
  const [message, setMessage] = useState('');

  const conversationQuery = useQuery(getConversationsOptions());
  const conversationData = conversationQuery?.data;
  const { ws, unreadCounts } = useWebSocketContext();

  const messagesQuery = useInfiniteQuery(
    getMessagesInfiniteOptions(conversationId || ''),
  );

  // Flatten all accumulated pages into one list, then reverse for display (oldest → newest)
  const messages = messagesQuery.data?.pages
    .flatMap((page) => page.paginatedResult.data)
    .reverse();

  useEffect(() => {
    if (!!conversationData && conversationData?.length > 0) {
      setChats(conversationData);
    }
  }, [conversationData]);

  useEffect(() => {
    if (!!conversationId && chats.length > 0) {
      const chat = chats.find((c) => c.id === conversationId);
      setSelectedChat(chat || null);
    }
  }, [conversationId, chats]);

  const loadMoreMessages = () => {
    if (!messagesQuery.hasNextPage || messagesQuery.isFetchingNextPage) return;
    messagesQuery.fetchNextPage();
  };

  // Preserve scroll position when older messages are loaded above
  useEffect(() => {
    if (messagesQuery.isFetchingNextPage) {
      prevScrollHeightRef.current =
        messageContainerRef.current?.scrollHeight ?? 0;
    } else {
      const newHeight = messageContainerRef.current?.scrollHeight ?? 0;
      messageContainerRef.current?.scrollTo({
        top: newHeight - prevScrollHeightRef.current,
      });
    }
  }, [messagesQuery.isFetchingNextPage]);

  const otherParticipant = useMemo(() => {
    if (!selectedChat || !userData) return null;

    const otherParticipant = selectedChat.participants.filter(
      (p) => p.memberId !== userData.id,
    )[0];

    return otherParticipant || null;
  }, [selectedChat, userData]);

  const handleChatSelect = (chat: TConversationResponse) => {
    if (!userData) return;

    setSelectedChat(chat);
    setChats((prev) =>
      prev.map((c) =>
        c.id === chat.id
          ? {
              ...c,
              participants: c.participants.map((p) =>
                p.memberId === userData.id ? { ...p, unseenCount: 0 } : p,
              ),
            }
          : c,
      ),
    );

    router.push(`?conversationId=${chat.id}`);
  };

  const handleSend = async (e: any) => {
    e.preventDefault();

    if (!ws || !message?.trim() || !selectedChat?.id || !otherParticipant)
      return;

    const payload: TChatIncomingMessage = {
      fromUserId: userData.id,
      toUserId: otherParticipant?.memberId || '',
      messageBody: message.trim(),
      conversationId: selectedChat?.id || '',
      senderType: 'user',
      type: 'NEW_MESSAGE',
    };

    ws.send(JSON.stringify(payload));
    setMessage('');
  };

  return (
    <div className="w-full">
      <div className="md:w-[80%] mx-auto pt-5">
        <div className="flex h-[80vh] shadow-sm overflow-hidden">
          <aside className="w-[320px] border-r border-gray-200 bg-gray-50">
            <div className="p-4 border-b border-b-gray-200 text-lg font-semibold text-gray-800">
              Messages
            </div>

            <div className="divide-y divide-gray-200">
              {conversationQuery?.isLoading ? (
                <div className="p-4 text-sm text-gray-500">Loading...</div>
              ) : chats.length === 0 || !userData ? (
                <div className="p-4 text-sm text-gray-500">
                  No conversations
                </div>
              ) : (
                chats.map((chat) => {
                  const isActive = selectedChat?.id === chat.id;

                  const otherParticipant = chat.participants.filter(
                    (p) => p.memberId !== userData.id,
                  )[0];

                  if (!otherParticipant) return null;

                  return (
                    <button
                      key={chat.id}
                      className={`w-full text-left px-4 cursor-pointer py-3 transition hover:bg-blue-50 ${isActive ? 'bg-blue-100' : ''}`}
                      onClick={() => handleChatSelect(chat)}
                    >
                      <div className="flex items-center gap-3">
                        <Image
                          src={
                            otherParticipant.memberData?.avatar?.fileUrl ||
                            '/default-avatar.jpg'
                          }
                          alt={otherParticipant.memberData?.name || ''}
                          width={40}
                          height={40}
                          className="rounded-full border w-[40px] h-[40px] object-cover"
                        />

                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-800 font-semibold">
                              {otherParticipant.memberData?.name}
                            </span>
                            {otherParticipant.isOnline && (
                              <span className="size-2 rounded-full bg-green-500" />
                            )}
                          </div>

                          <p className="text-sm text-gray-500 truncate max-w-[170px]">
                            {chat?.lastMessage || ''}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          <aside className="flex flex-col flex-1 bg-gray-100">
            {selectedChat && !!otherParticipant && !!userData ? (
              <>
                <div className="p-4 border-b border-b-gray-200 bg-white flex items-center gap-3">
                  <Image
                    src={
                      otherParticipant.memberData?.avatar?.fileUrl ||
                      '/default-avatar.jpg'
                    }
                    alt={otherParticipant.memberData?.name || ''}
                    width={40}
                    height={40}
                    className="rounded-full border w-[40px] h-[40px] object-cover"
                  />

                  <div>
                    <h2 className="text-gray-800 font-semibold text-base">
                      {otherParticipant?.memberData?.name}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {otherParticipant?.isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>

                {!!messages && (
                  <div
                    ref={messageContainerRef}
                    className="flex-1 overflow-y-auto p-6 space-y-4 text-sm"
                  >
                    {messagesQuery.hasNextPage && (
                      <div className="flex justify-center mb-2">
                        <button
                          onClick={loadMoreMessages}
                          disabled={messagesQuery.isFetchingNextPage}
                          className="text-xs px-4 py-1 bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                        >
                          {messagesQuery.isFetchingNextPage
                            ? 'Loading...'
                            : 'Load previous messages'}
                        </button>
                      </div>
                    )}

                    {messages.map((msg, index) => {
                      const isActiveUser = msg.senderId === userData.id;
                      return (
                        <div
                          key={index}
                          className={`flex flex-col ${isActiveUser ? 'items-end ml-auto' : 'items-start'} max-w-[80%] break-words`}
                        >
                          <div
                            className={`flex items-center gap-2 ${isActiveUser ? 'bg-blue-600 text-white' : 'bg-white text-gray-800'} px-4 py-2 rounded-lg shadow-sm w-fit`}
                          >
                            <Image
                              src={
                                otherParticipant.memberData?.avatar?.fileUrl ||
                                '/default-avatar.jpg'
                              }
                              alt={otherParticipant.memberData?.name || ''}
                              width={30}
                              height={30}
                              className="rounded-full border w-[30px] h-[30px] object-cover"
                            />

                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-800 font-semibold">
                                  {otherParticipant.memberData?.name}
                                </span>
                                {otherParticipant.isOnline && (
                                  <span className="size-2 rounded-full bg-green-500" />
                                )}
                              </div>

                              <p className="text-sm text-gray-500 truncate">
                                {msg.messageBody}
                              </p>

                              <div
                                className={`text-11px text-gray-400 mt-1 flex items-center ${isActiveUser ? 'mr-1 justify-end' : 'ml-1'}`}
                              >
                                {msg.createdAt &&
                                  new Date(msg.createdAt).toLocaleTimeString(
                                    [],
                                    {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    },
                                  )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <div ref={scrollAnchorRef} />
                  </div>
                )}

                <ChatInput
                  message={message}
                  setMessage={setMessage}
                  onSendMessage={handleSend}
                />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                Select a conversation to start chatting
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default InboxPageClient;
