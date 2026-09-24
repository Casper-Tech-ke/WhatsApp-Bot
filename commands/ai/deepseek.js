import { createAiCommand } from '../../lib/aiCommand.js';

export default createAiCommand({
	name: 'deepseek',
	alias: ['deep'],
	description: 'Chat with DeepSeek AI.',
	endpoint: 'deepseek'
});
