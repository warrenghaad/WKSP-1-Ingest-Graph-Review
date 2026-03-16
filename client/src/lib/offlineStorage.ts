const DB_NAME = "chronos-offline";
const DB_VERSION = 1;

const STORES = {
  documents: "documents",
  savedImages: "savedImages",
  cachedImageBlobs: "cachedImageBlobs",
  meta: "meta",
} as const;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORES.documents)) {
        db.createObjectStore(STORES.documents, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORES.savedImages)) {
        db.createObjectStore(STORES.savedImages, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORES.cachedImageBlobs)) {
        db.createObjectStore(STORES.cachedImageBlobs, { keyPath: "url" });
      }
      if (!db.objectStoreNames.contains(STORES.meta)) {
        db.createObjectStore(STORES.meta, { keyPath: "key" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function tx(
  db: IDBDatabase,
  store: string,
  mode: IDBTransactionMode
): IDBObjectStore {
  return db.transaction(store, mode).objectStore(store);
}

function promisify<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export interface OfflineDocument {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  savedAt: string;
}

export interface OfflineSavedImage {
  id: number;
  url: string;
  title: string | null;
  source: string | null;
  query: string | null;
  createdAt: string;
  cachedOffline: boolean;
}

export async function saveDocumentOffline(doc: OfflineDocument): Promise<void> {
  const db = await openDB();
  await promisify(tx(db, STORES.documents, "readwrite").put(doc));
  db.close();
}

export async function getAllOfflineDocuments(): Promise<OfflineDocument[]> {
  const db = await openDB();
  const result = await promisify(tx(db, STORES.documents, "readonly").getAll());
  db.close();
  return result;
}

export async function deleteOfflineDocument(id: string): Promise<void> {
  const db = await openDB();
  await promisify(tx(db, STORES.documents, "readwrite").delete(id));
  db.close();
}

export async function saveSavedImagesOffline(
  images: OfflineSavedImage[]
): Promise<void> {
  const db = await openDB();
  const store = tx(db, STORES.savedImages, "readwrite");
  await promisify(store.clear());
  for (const img of images) {
    store.put(img);
  }
  db.close();
}

export async function getOfflineSavedImages(): Promise<OfflineSavedImage[]> {
  const db = await openDB();
  const result = await promisify(
    tx(db, STORES.savedImages, "readonly").getAll()
  );
  db.close();
  return result;
}

export async function cacheImageBlob(url: string): Promise<string | null> {
  if (url.startsWith("data:")) {
    const db = await openDB();
    await promisify(
      tx(db, STORES.cachedImageBlobs, "readwrite").put({
        url,
        blob: url,
        cachedAt: new Date().toISOString(),
      })
    );
    db.close();
    return url;
  }

  try {
    const response = await fetch(url, { mode: "cors" });
    if (!response.ok) return null;

    const blob = await response.blob();
    const reader = new FileReader();
    const dataUrl = await new Promise<string>((resolve) => {
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });

    const db = await openDB();
    await promisify(
      tx(db, STORES.cachedImageBlobs, "readwrite").put({
        url,
        blob: dataUrl,
        cachedAt: new Date().toISOString(),
      })
    );
    db.close();
    return dataUrl;
  } catch {
    return null;
  }
}

export async function getCachedImageBlob(
  url: string
): Promise<string | null> {
  try {
    const db = await openDB();
    const result = await promisify(
      tx(db, STORES.cachedImageBlobs, "readonly").get(url)
    );
    db.close();
    return result?.blob || null;
  } catch {
    return null;
  }
}

export async function getCachedImageCount(): Promise<number> {
  const db = await openDB();
  const result = await promisify(
    tx(db, STORES.cachedImageBlobs, "readonly").count()
  );
  db.close();
  return result;
}

export async function setMeta(key: string, value: any): Promise<void> {
  const db = await openDB();
  await promisify(
    tx(db, STORES.meta, "readwrite").put({ key, value })
  );
  db.close();
}

export async function getMeta(key: string): Promise<any> {
  const db = await openDB();
  const result = await promisify(
    tx(db, STORES.meta, "readonly").get(key)
  );
  db.close();
  return result?.value;
}

export async function clearAllOfflineData(): Promise<void> {
  const db = await openDB();
  await promisify(tx(db, STORES.documents, "readwrite").clear());
  await promisify(tx(db, STORES.savedImages, "readwrite").clear());
  await promisify(tx(db, STORES.cachedImageBlobs, "readwrite").clear());
  await promisify(tx(db, STORES.meta, "readwrite").clear());
  db.close();
}

export async function getOfflineStorageSize(): Promise<{
  documents: number;
  images: number;
  cachedBlobs: number;
}> {
  const db = await openDB();
  const documents = await promisify(
    tx(db, STORES.documents, "readonly").count()
  );
  const images = await promisify(
    tx(db, STORES.savedImages, "readonly").count()
  );
  const cachedBlobs = await promisify(
    tx(db, STORES.cachedImageBlobs, "readonly").count()
  );
  db.close();
  return { documents, images, cachedBlobs };
}
