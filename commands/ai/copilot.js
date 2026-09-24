import { createAiCommand } from '../../lib/aiCommand.js';

export default createAiCommand({
	name: 'copilot',
	alias: ['githubcopilot'],
	description: 'Chat with Copilot AI.',
	endpoint: 'copilot'
});
