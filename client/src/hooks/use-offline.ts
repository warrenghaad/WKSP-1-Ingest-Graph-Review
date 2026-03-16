import { useState, useEffect, useCallback, useRef } from "react";
import {
  saveDocumentOffline,
  getAllOfflineDocuments,
  saveSavedImagesOffline,
  getOfflineSavedImages,
  cacheImageBlob,
  getCachedImageBlob,
  getOfflineStorageSize,
  type OfflineDocument,
  type OfflineSavedImage,
} from "@/lib/offlineStorage";

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

export function useOfflineDocuments() {
  const [offlineDocs, setOfflineDocs] = useState<OfflineDocument[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const refresh = useCallback(async () => {
    const docs = await getAllOfflineDocuments();
    setOfflineDocs(docs);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveForOffline = useCallback(
    async (doc: { id: string; title: string; subtitle: string; content: string }) => {
      setIsSaving(true);
      try {
        await saveDocumentOffline({
          ...doc,
          savedAt: new Date().toISOString(),
        });
        await refresh();
      } finally {
        setIsSaving(false);
      }
    },
    [refresh]
  );

  const isDocOffline = useCallback(
    (id: string) => offlineDocs.some((d) => d.id === id),
    [offlineDocs]
  );

  return { offlineDocs, saveForOffline, isDocOffline, isSaving, refresh };
}

export function useOfflineImages() {
  const [cachingProgress, setCachingProgress] = useState<{
    total: number;
    cached: number;
    active: boolean;
  }>({ total: 0, cached: 0, active: false });
  const abortRef = useRef(false);

  const syncSavedImages = useCallback(async (images: any[]) => {
    const offlineImages: OfflineSavedImage[] = images.map((img) => ({
      id: img.id,
      url: img.url,
      title: img.title,
      source: img.source,
      query: img.query,
      createdAt: img.createdAt,
      cachedOffline: false,
    }));
    await saveSavedImagesOffline(offlineImages);
  }, []);

  const cacheAllImages = useCallback(async (imageUrls: string[]) => {
    abortRef.current = false;
    const urls = imageUrls.filter((u) => u && !u.startsWith("data:"));
    setCachingProgress({ total: urls.length, cached: 0, active: true });

    let cached = 0;
    for (const url of urls) {
      if (abortRef.current) break;
      await cacheImageBlob(url);
      cached++;
      setCachingProgress({ total: urls.length, cached, active: true });
    }

    setCachingProgress((p) => ({ ...p, active: false }));
  }, []);

  const stopCaching = useCallback(() => {
    abortRef.current = true;
  }, []);

  const getOfflineImageUrl = useCallback(async (url: string) => {
    return getCachedImageBlob(url);
  }, []);

  const getStorageInfo = useCallback(async () => {
    return getOfflineStorageSize();
  }, []);

  return {
    syncSavedImages,
    cacheAllImages,
    stopCaching,
    getOfflineImageUrl,
    getStorageInfo,
    cachingProgress,
  };
}
