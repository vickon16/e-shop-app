import { atom } from 'jotai';
import { Routes } from './routes';

export const activeSidebarItem = atom<string>(Routes.dashboard.base);
