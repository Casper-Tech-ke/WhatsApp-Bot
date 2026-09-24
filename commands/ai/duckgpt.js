import { createAiCommand } from '../../lib/aiCommand.js';

export default createAiCommand({
	name: 'duckgpt',
	alias: ['duck'],
	description: 'Chat with DuckGPT AI.',
	endpoint: 'duckgpt'
});
