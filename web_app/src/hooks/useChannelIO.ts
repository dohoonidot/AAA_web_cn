import { useEffect, useRef, useState } from 'react';

// ChannelIO 글로벌 타입 선언
declare global {
    interface Window {
        ChannelIO?: {
            (...args: unknown[]): void;
            q?: unknown[][];
            c?: (args: unknown[]) => void;
        };
        ChannelIOInitialized?: boolean;
    }
}

const PLUGIN_KEY = 'b0453835-5713-4a0b-8a91-7e6f630931fd';

/**
 * ChannelIO SDK를 로드하고 메신저 열기/닫기 상태를 관리하는 훅.
 * 컴포넌트가 마운트될 때 자동으로 boot 합니다.
 */
export function useChannelIO() {
    const [isOpen, setIsOpen] = useState(false);
    const booted = useRef(false);

    useEffect(() => {
        // 이미 초기화된 경우 스킵
        if (booted.current) return;
        booted.current = true;

        // ChannelIO 스텁 설정 (공식 스니펫과 동일)
        if (!window.ChannelIO) {
            const ch = (...args: unknown[]) => {
                ch.q = ch.q || [];
                ch.q.push(args);
            };
            ch.q = [] as unknown[][];
            window.ChannelIO = ch as Window['ChannelIO'];
        }

        // SDK 스크립트 로드 (중복 방지)
        if (!window.ChannelIOInitialized) {
            window.ChannelIOInitialized = true;
            const s = document.createElement('script');
            s.type = 'text/javascript';
            s.async = true;
            s.src = 'https://cdn.channel.io/plugin/ch-plugin-web.js';
            const x = document.getElementsByTagName('script')[0];
            if (x && x.parentNode) {
                x.parentNode.insertBefore(s, x);
            } else {
                document.head.appendChild(s);
            }
        }

        // boot: 런처 버튼은 숨기고, 콜백으로 열기/닫기 상태 추적
        window.ChannelIO?.('boot', {
            pluginKey: PLUGIN_KEY,
            hideChannelButtonOnBoot: true, // 기본 플로팅 버튼 숨김
        });

        // 메신저가 닫힐 때 isOpen 상태를 false로
        window.ChannelIO?.('onHideMessenger', () => {
            setIsOpen(false);
        });

        // 언마운트 시 shutdown (페이지 이동 대비 - 선택적)
        // return () => { window.ChannelIO?.('shutdown'); };
    }, []);

    /** 메신저 열기 */
    const openMessenger = () => {
        window.ChannelIO?.('showMessenger');
        setIsOpen(true);
    };

    /** 메신저 닫기 */
    const closeMessenger = () => {
        window.ChannelIO?.('hideMessenger');
        setIsOpen(false);
    };

    return { isOpen, openMessenger, closeMessenger };
}
