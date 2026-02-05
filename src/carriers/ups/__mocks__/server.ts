import { setupServer } from 'msw/node';
import { upsHandlers } from './ups.handlers.js';

export const server = setupServer(...upsHandlers);
