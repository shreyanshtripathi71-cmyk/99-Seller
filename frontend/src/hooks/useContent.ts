import { useState, useEffect } from 'react';
import { adminAPI } from '@/services/api';

/**
 * Hook to fetch site content with a default fallback.
 * @param key The content key (e.g., 'page_about')
 * @param defaultContent The fallback content object
 * @returns { content, loading, error, refresh }
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
                // Deep merge or simple replacement? 
                // Simple replacement is safer for CMS logic where the user defines the whole object.
                setContent(result.data.value);
                setError(null);
            } else {
                // If success but no data, use default
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
