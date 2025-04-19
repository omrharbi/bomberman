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
                jsx('div', { className: 'game-canvas' })
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
        ),

        // Footer
        jsx('div', { className: 'footer' },
            jsx('div', { className: 'footer-content' },

                jsx('div', { className: 'footer-section lives-section' },
                    jsx('p', {},
                        'Lives: 3',
                        jsx('img', { src: '../images/heart.png', alt: 'Heart', className: 'heart-icon' })
                    )
                ),

                jsx('div', { className: 'footer-section players-section' },
                    jsx('p', {}, 'Players:'),
                    // hadi 7ta nbadlo 3liha
                    jsx('ul', { className: 'connected-players' },
                        jsx('li', {}, 'Player1'),
                        jsx('li', {}, 'Player2')
                    )
                ),

                jsx('div', { className: 'footer-section status-section' },
                    jsx('p', {}, 'Status: Game In Progress')
                )
            ),

            // jsx('p', { className: 'copyright' }, 'Copyright © 2023 Bomber Man')
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
