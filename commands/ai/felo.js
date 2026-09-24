import { createAiCommand } from '../../lib/aiCommand.js';

export default createAiCommand({
	name: 'felo',
	alias: ['feloai'],
	description: 'Chat with Felo AI.',
	endpoint: 'felo'
});
