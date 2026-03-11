import { registerRoute } from '@e-shop-app/packages/libs/swagger';
import express from 'express';
import {
  createNewConversationContract,
  getMessagesContract,
  getConversationsContract,
} from '../contracts/chat.contract';
import {
  createNewConversationController,
  getMessagesController,
  getConversationsController,
} from '../controllers/chat.controller';

const chatRouter = express.Router();

// create new conversation
registerRoute(
  chatRouter,
  createNewConversationContract,
  createNewConversationController,
);

// get user conversation
registerRoute(chatRouter, getConversationsContract, getConversationsController);

// get messages
registerRoute(chatRouter, getMessagesContract, getMessagesController);

export default chatRouter;
