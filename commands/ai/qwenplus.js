import { createAiCommand } from '../../lib/aiCommand.js';

export default createAiCommand({
    name: 'qwen-plus',
    alias: ['qplus'],
    description: 'Chat with Qwen Plus Thinking.',
    endpoint: 'qwen-plus'
});