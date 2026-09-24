import { createAiCommand } from '../../lib/aiCommand.js';

export default createAiCommand({
    name: 'llama',
    alias: ['llama4'],
    description: 'Chat with Llama 4 Scout.',
    endpoint: 'llama'
});