import { createAiCommand } from '../../lib/aiCommand.js';

export default createAiCommand({
    name: 'venice',
    alias: ['veniceai'],
    description: 'Chat with Venice AI.',
    endpoint: 'venice',
    parameter: 'question'
});