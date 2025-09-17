<script>
    document.addEventListener('DOMContentLoaded', () => {
        const chatInputForm = document.getElementById('chat-input-form');
        const chatInput = document.getElementById('chat-input');
        const chatMessages = document.getElementById('chat-messages');
        const systemPromptInput = document.getElementById('system-prompt');

        let chatHistory = [];

        chatInputForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const userMessage = chatInput.value.trim();
            if (!userMessage) return;
            
            // Lấy system prompt từ ô nhập liệu
            const systemPrompt = systemPromptInput.value.trim();

            // Thêm tin nhắn của người dùng vào lịch sử chat và hiển thị
            addChatMessage(userMessage, 'user');
            chatInput.value = '';

            addChatMessage('đang gõ...', 'ai-thinking');

            // Cấu trúc history cho API, tương thích với cả Gemini và OpenAI
            const formattedHistory = chatHistory.map(item => ({
                role: item.role,
                parts: [{ text: item.content }]
            }));

            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        prompt: userMessage,
                        history: formattedHistory, // Gửi toàn bộ lịch sử chat
                        systemPrompt: systemPrompt || undefined // Gửi system prompt
                    })
                });
                const data = await response.json();
                const thinkingBubble = chatMessages.querySelector('.ai-thinking');
                if (thinkingBubble) thinkingBubble.remove();
                
                const aiReply = data.reply || 'Không có phản hồi';
                addChatMessage(aiReply, 'ai');

                // Thêm tin nhắn của người dùng và AI vào lịch sử chat
                chatHistory.push({ role: 'user', content: userMessage });
                chatHistory.push({ role: 'assistant', content: aiReply });

            } catch (err) {
                const thinkingBubble = chatMessages.querySelector('.ai-thinking');
                if (thinkingBubble) thinkingBubble.remove();
                addChatMessage('Lỗi khi gọi API', 'ai');
                console.error(err);
            }
        });

        function addChatMessage(message, type) {
            const bubble = document.createElement('div');
            bubble.classList.add('chat-bubble', type);
            if (type === 'ai-thinking') {
                bubble.classList.add('ai'); 
            }
            bubble.textContent = message;
            chatMessages.appendChild(bubble);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    });
</script>
