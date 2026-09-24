import { createAiCommand } from '../../lib/aiCommand.js';

export default createAiCommand({
    name: 'qwen',
    alias: ['qwencoder'],
    description: 'Chat with Qwen3 Coder.',
    endpoint: 'qwen'
});