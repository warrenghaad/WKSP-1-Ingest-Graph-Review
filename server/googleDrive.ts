import { ReplitConnectors } from "@replit/connectors-sdk";

const connectors = new ReplitConnectors();

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  parents?: string[];
  webViewLink?: string;
  thumbnailLink?: string;
  iconLink?: string;
}

async function driveFetch(path: string, init?: RequestInit): Promise<Response> {
  return await connectors.proxy("google-drive", path, {
    method: "GET",
    ...init,
  });
}

export function parseFolderId(input: string): string {
  const m1 = input.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (m1) return m1[1];
  const m2 = input.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m2) return m2[1];
  return input.trim();
}

export async function listFolder(
  folderId: string,
  pageToken?: string,
  pageSize = 100,
): Promise<{ files: DriveFile[]; nextPageToken?: string }> {
  const id = parseFolderId(folderId);
  const fields = "nextPageToken,files(id,name,mimeType,size,modifiedTime,parents,webViewLink,thumbnailLink,iconLink)";
  const params = new URLSearchParams({
    q: `'${id}' in parents and trashed=false`,
    fields,
    pageSize: String(pageSize),
    orderBy: "folder,name",
    supportsAllDrives: "true",
    includeItemsFromAllDrives: "true",
  });
  if (pageToken) params.set("pageToken", pageToken);

  const res = await driveFetch(`/drive/v3/files?${params.toString()}`);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Drive list failed (${res.status}): ${txt.slice(0, 300)}`);
  }
  const data = (await res.json()) as { files?: DriveFile[]; nextPageToken?: string };
  return { files: data.files ?? [], nextPageToken: data.nextPageToken };
}

export async function getFileMetadata(fileId: string): Promise<DriveFile> {
  const fields = "id,name,mimeType,size,modifiedTime,parents,webViewLink,thumbnailLink,iconLink";
  const res = await driveFetch(`/drive/v3/files/${fileId}?fields=${fields}&supportsAllDrives=true`);
  if (!res.ok) throw new Error(`Drive metadata failed (${res.status})`);
  return (await res.json()) as DriveFile;
}

export async function downloadFileText(fileId: string, maxBytes = 1_000_000): Promise<string> {
  const meta = await getFileMetadata(fileId);
  let path: string;
  if (meta.mimeType === "application/vnd.google-apps.document") {
    path = `/drive/v3/files/${fileId}/export?mimeType=text/plain`;
  } else if (meta.mimeType === "application/vnd.google-apps.spreadsheet") {
    path = `/drive/v3/files/${fileId}/export?mimeType=text/csv`;
  } else {
    path = `/drive/v3/files/${fileId}?alt=media&supportsAllDrives=true`;
  }
  const res = await driveFetch(path);
  if (!res.ok) throw new Error(`Drive download failed (${res.status})`);
  const buf = await res.arrayBuffer();
  const slice = buf.byteLength > maxBytes ? buf.slice(0, maxBytes) : buf;
  return new TextDecoder("utf-8", { fatal: false }).decode(slice);
}

export async function whoami(): Promise<{ user?: { displayName?: string; emailAddress?: string } }> {
  const res = await driveFetch(`/drive/v3/about?fields=user(displayName,emailAddress)`);
  if (!res.ok) throw new Error(`Drive about failed (${res.status})`);
  return (await res.json()) as { user?: { displayName?: string; emailAddress?: string } };
}
