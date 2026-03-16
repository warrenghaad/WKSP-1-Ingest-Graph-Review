import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wifi, WifiOff, HardDrive, Download, Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOnlineStatus, useOfflineDocuments, useOfflineImages } from "@/hooks/use-offline";

interface OfflineIndicatorProps {
  currentDocId?: string;
  currentDocTitle?: string;
  currentDocSubtitle?: string;
  currentDocContent?: string;
  savedImageUrls?: string[];
  savedImages?: any[];
}

export default function OfflineIndicator({
  currentDocId,
  currentDocTitle,
  currentDocSubtitle,
  currentDocContent,
  savedImageUrls = [],
  savedImages = [],
}: OfflineIndicatorProps) {
  const isOnline = useOnlineStatus();
  const { saveForOffline, isDocOffline, isSaving } = useOfflineDocuments();
  const { syncSavedImages, cacheAllImages, stopCaching, cachingProgress, getStorageInfo } = useOfflineImages();
  const [panelOpen, setPanelOpen] = useState(false);
  const [storageInfo, setStorageInfo] = useState<{ documents: number; images: number; cachedBlobs: number } | null>(null);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);

  const docIsOffline = currentDocId ? isDocOffline(currentDocId) : false;

  useEffect(() => {
    if (!isOnline) {
      setShowOfflineBanner(true);
    } else {
      const timer = setTimeout(() => setShowOfflineBanner(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  useEffect(() => {
    if (panelOpen) {
      getStorageInfo().then(setStorageInfo);
    }
  }, [panelOpen, getStorageInfo]);

  const handleSaveDoc = async () => {
    if (!currentDocId || !currentDocContent) return;
    await saveForOffline({
      id: currentDocId,
      title: currentDocTitle || "Untitled",
      subtitle: currentDocSubtitle || "",
      content: currentDocContent,
    });
  };

  const handleCacheImages = async () => {
    if (savedImages.length > 0) {
      await syncSavedImages(savedImages);
    }
    if (savedImageUrls.length > 0) {
      await cacheAllImages(savedImageUrls);
    }
    getStorageInfo().then(setStorageInfo);
  };

  return (
    <>
      <AnimatePresence>
        {showOfflineBanner && !isOnline && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed top-0 left-0 right-0 z-[100] bg-amber-600 text-white text-center py-2 px-4 text-sm font-medium flex items-center justify-center gap-2"
          >
            <WifiOff className="w-4 h-4" />
            You're offline — viewing cached content
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        <Button
          data-testid="button-offline-toggle"
          variant="ghost"
          size="icon"
          className={`rounded-full h-9 w-9 relative ${!isOnline ? 'text-amber-500' : ''}`}
          onClick={() => setPanelOpen(!panelOpen)}
        >
          {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
          {(docIsOffline || (storageInfo && storageInfo.cachedBlobs > 0)) && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
          )}
        </Button>

        <AnimatePresence>
          {panelOpen && (
            <motion.div
              initial={{ opacity: 0, y: -5, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -5, scale: 0.95 }}
              className="absolute top-full right-0 mt-2 w-[320px] bg-popover border border-border rounded-xl shadow-xl z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Offline Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${isOnline ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}>
                    {isOnline ? "Online" : "Offline"}
                  </span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setPanelOpen(false)}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Current Document</span>
                  </div>
                  {currentDocId ? (
                    <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{currentDocTitle}</p>
                        <p className="text-xs text-muted-foreground">
                          {docIsOffline ? "Available offline" : "Not saved offline"}
                        </p>
                      </div>
                      <Button
                        data-testid="button-save-doc-offline"
                        size="sm"
                        variant={docIsOffline ? "secondary" : "default"}
                        className="ml-2 gap-1.5 flex-shrink-0"
                        onClick={handleSaveDoc}
                        disabled={isSaving || docIsOffline}
                      >
                        {isSaving ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : docIsOffline ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Download className="w-3 h-3" />
                        )}
                        {docIsOffline ? "Saved" : "Save"}
                      </Button>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No document loaded</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Saved Images</span>
                    <span className="text-xs text-muted-foreground">{savedImageUrls.length} images</span>
                  </div>
                  <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                    <div>
                      <p className="text-sm font-medium">
                        {storageInfo ? `${storageInfo.cachedBlobs} cached` : "–"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {cachingProgress.active
                          ? `Caching ${cachingProgress.cached}/${cachingProgress.total}...`
                          : "Image blobs stored locally"}
                      </p>
                    </div>
                    {cachingProgress.active ? (
                      <Button size="sm" variant="destructive" className="gap-1.5" onClick={stopCaching}>
                        <X className="w-3 h-3" /> Stop
                      </Button>
                    ) : (
                      <Button
                        data-testid="button-cache-images"
                        size="sm"
                        className="gap-1.5"
                        onClick={handleCacheImages}
                        disabled={savedImageUrls.length === 0}
                      >
                        <Download className="w-3 h-3" /> Cache All
                      </Button>
                    )}
                  </div>

                  {cachingProgress.active && (
                    <div className="mt-2">
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-primary rounded-full"
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(cachingProgress.cached / Math.max(cachingProgress.total, 1)) * 100}%`,
                          }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {storageInfo && (
                  <div className="pt-2 border-t border-border">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-lg font-semibold">{storageInfo.documents}</p>
                        <p className="text-[10px] text-muted-foreground">Docs</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold">{storageInfo.images}</p>
                        <p className="text-[10px] text-muted-foreground">Saved</p>
                      </div>
                      <div>
                        <p className="text-lg font-semibold">{storageInfo.cachedBlobs}</p>
                        <p className="text-[10px] text-muted-foreground">Cached</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
