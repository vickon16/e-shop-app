import { WebSocketProvider } from '@/contexts/web-socket-context';
import { axiosInstance } from '@/lib/axios';
import {
  TBaseServerResponse,
  TUserWithRelations,
} from '@e-shop-app/packages/types';
import { cookies } from 'next/headers';
import InboxPageClient from './_components/InboxPageClient';

type Props = {
  searchParams: Promise<{
    conversationId: string;
  }>;
};

const getUserData = async (cookies: string) => {
  try {
    const response = await axiosInstance.get<
      TBaseServerResponse<TUserWithRelations>
    >(`/auth/get-user-info`, {
      headers: {
        Cookie: cookies,
      },
    });

    if (!response.data.success || !response.data.data) {
      throw new Error('Failed to get user data');
    }

    return response.data.data;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

const InboxPage = async ({ searchParams }: Props) => {
  const { conversationId } = await searchParams;
  const cookieStore = await cookies();
  const cookieString = cookieStore.toString();

  const userData = await getUserData(cookieString);

  if (!userData) return null;

  return (
    <WebSocketProvider user={userData}>
      <InboxPageClient conversationId={conversationId} userData={userData} />
    </WebSocketProvider>
  );
};

export default InboxPage;
