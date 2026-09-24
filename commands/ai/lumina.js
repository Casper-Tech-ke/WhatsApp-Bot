import { createAiCommand } from '../../lib/aiCommand.js';

export default createAiCommand({
    name: 'lumina',
    alias: ['lumi'],
    description: 'Chat with Ai Lumina.',
    endpoint: 'lumina'
});