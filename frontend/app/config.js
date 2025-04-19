import { jsx } from '../src/framework.js';

export function GamePage() {
    return jsx(
        'div', {},

        // Header
        jsx('header', { className: 'header' },
            jsx('h1', { className: 'game-title' }, 'Bomber Man')
        ),

        // Content Container
        jsx('div', { className: 'content-container' },

            // Main Game Area
            jsx('main', { className: 'game-area' },
                jsx('div', { className: 'game-canvas', id:"game" })
            ),

            // Sidebar Chat Area
            jsx('aside', { className: 'chat-sidebar' },
                
                // Message Container
                jsx('div', { className: 'message-container' }),

                // Chat Input Area
                jsx('div', { className: 'chat-input-area' },
                    jsx('input', {
                        type: 'text',
                        className: 'chat-input',
                        placeholder: 'Type a message...'
                    }),
                    jsx('button', { className: 'send-button' }, 'Send')
                )
            )
        )
    );
}
 
export function LoginPage() {
    return jsx(
        'div', { id: 'login' },

        jsx('h1', {}, 'bomberMane'),

        jsx('p', { id: 'cont' }),

        jsx('div', { id: 'input' },
            jsx('input', {
                type: 'text',
                id: 'name',
                placeholder: 'Enter your Name'
            }),
            jsx('button', { id: 'NameBut' }, 'Go')
        )
    );
}
