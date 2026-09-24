import { createAiCommand } from '../../lib/aiCommand.js';

export default createAiCommand({
	name: 'claude',
	alias: ['anthropic'],
	description: 'Chat with Claude AI.',
	endpoint: 'claude'
});
