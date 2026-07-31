/**
 * Helper utility to parse basic markdown strings into sanitized HTML.
 * Supports bold, italic, inline code, headers, and bulleted lists.
 */
export const parseMarkdownToHtml = (markdown: string): string => {
    if (!markdown) return '';

    const lines = markdown.split('\n');
    let html = '';
    let inList = false;

    // Helper to format inline markdown elements
    const formatInline = (text: string): string => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/__(.*?)__/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/_(.*?)_/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-dark-secondary-2 px-1 py-0.5 rounded font-mono text-xs font-semibold">$1</code>');
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Match bullet lists (starts with '*' or '-' followed by spaces)
        const listMatch = line.match(/^(\s*)[\*\-]\s+(.*)$/);

        if (listMatch) {
            const content = listMatch[2];
            if (!inList) {
                html += '<ul class="list-disc pl-5 mb-2 mt-1 space-y-1">';
                inList = true;
            }
            html += `<li>${formatInline(content)}</li>`;
        } else {
            if (inList) {
                html += '</ul>';
                inList = false;
            }

            if (trimmed === '') {
                // Prevent duplicate spacing between paragraphs/lists
                if (html !== '' && !html.endsWith('<br />') && !html.endsWith('</p>') && !html.endsWith('</ul>') && !html.endsWith('>')) {
                    html += '<br />';
                }
            } else {
                // Match headers (### Header)
                const headerMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
                if (headerMatch) {
                    const level = headerMatch[1].length;
                    const content = headerMatch[2];
                    // Map headers to appropriate visual size classes
                    const sizeClass = level === 1 ? 'text-lg' : level === 2 ? 'text-base' : 'text-sm';
                    html += `<h${level} class="font-bold my-2 ${sizeClass}">${formatInline(content)}</h${level}>`;
                } else {
                    html += `<p class="mb-1">${formatInline(trimmed)}</p>`;
                }
            }
        }
    }

    if (inList) {
        html += '</ul>';
    }

    return html;
};
