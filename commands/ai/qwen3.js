import { createAiCommand } from '../../lib/aiCommand.js';

export default createAiCommand({
    name: 'qwen3',
    alias: ['qwen-next'],
    description: 'Chat with Qwen 3 Next.',
    endpoint: 'qwen3'
});