import { createAiCommand } from '../../lib/aiCommand.js';

export default createAiCommand({
    name: 'gita',
    alias: ['bhagavadgita'],
    description: 'Ask the Bhagavad Gita AI assistant.',
    endpoint: 'gita'
});