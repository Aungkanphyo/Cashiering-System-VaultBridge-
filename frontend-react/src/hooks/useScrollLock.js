import { useEffect } from "react";


const useScrollLock = (isOpen) => {
    useEffect(() => {
        if(!open) return;

        const scrollContainer = document.querySelector('main');
        if (!scrollContainer) return;

        const originalOverflow = scrollContainer.style.overflowY;
        const originalPadding = scrollContainer.style.paddingRight;

        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

        scrollContainer.style.overflowY = 'hidden';

        if (scrollbarWidth > 0) {
            scrollContainer.style.paddingRight = `${scrollbarWidth}px`;
        }

        return () => {
            scrollContainer.style.overflowY = originalOverflow;
            scrollContainer.style.paddingRight = originalPadding;
        }
    }, [isOpen]);
}

export default useScrollLock
