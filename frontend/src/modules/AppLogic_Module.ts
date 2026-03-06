"use client";
import { useEffect, useState } from "react";
import { adminAPI } from '@/services/api';

/**
 * ==========================================
 * HOOK: UseSticky
 * ==========================================
 */
interface StickyState {
    sticky: boolean;
}

export const UseSticky = (): StickyState => {
    const [sticky, setSticky] = useState(false);
    const stickyHeader = (): void => {
        if (window.scrollY > 200) {
            setSticky(true);
        } else {
            setSticky(false);
        }
    };

    useEffect(() => {
        window.addEventListener("scroll", stickyHeader);
        return (): void => {
            window.removeEventListener("scroll", stickyHeader);
        };
    }, []);
    return { sticky };
}

/**
 * ==========================================
 * HOOK: useLeadPagination
 * ==========================================
 */
export function useLeadPagination<T>(items: T[] = [], itemsPerPage = 10) {
    const [itemOffset, setItemOffset] = useState(0);
    const [currentItems, setCurrentItems] = useState<T[]>([]);

    useEffect(() => {
        const safeItems = Array.isArray(items) ? items : [];
        const endOffset = itemOffset + itemsPerPage;
        setCurrentItems(safeItems.slice(itemOffset, endOffset));
    }, [itemOffset, items, itemsPerPage]);

    const pageCount = Math.max(1, Math.ceil((Array.isArray(items) ? items.length : 0) / itemsPerPage));

    const handlePageClick = (event: { selected: number } | any) => {
        const safeItems = Array.isArray(items) ? items : [];
        if (safeItems.length === 0) return;
        const newOffset = (event?.selected ?? 0) * itemsPerPage;
        setItemOffset(newOffset % safeItems.length);
    };

    return { currentItems, pageCount, handlePageClick };
}

/**
 * ==========================================
 * HOOK: useContent
 * ==========================================
 */
export function useContent<T>(key: string, defaultContent: T) {
    const [content, setContent] = useState<T>(defaultContent);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchContent = async () => {
        setLoading(true);
        try {
            const result = await adminAPI.content.get(key);
            if (result.success && result.data?.value) {
                setContent(result.data.value);
                setError(null);
            } else {
                setContent(defaultContent);
            }
        } catch (err) {
            console.error(`Error fetching content for ${key}:`, err);
            setError('Failed to fetch content');
            setContent(defaultContent);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContent();
    }, [key]);

    return { content, loading, error, refresh: fetchContent };
}

/**
 * ==========================================
 * UTIL: animationCreate
 * ==========================================
 */
export const animationCreate = () => {
    if (typeof window !== "undefined") {
        import("wowjs").then((module) => {
            const WOW = module.default;
            new WOW.WOW({ live: false }).init()
        });
    }
};
