import { type User, type InsertUser, type SavedImage, type InsertSavedImage } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getSavedImages(): Promise<SavedImage[]>;
  saveImage(image: InsertSavedImage): Promise<SavedImage>;
  deleteSavedImage(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private images: Map<number, SavedImage>;
  private nextImageId: number;

  constructor() {
    this.users = new Map();
    this.images = new Map();
    this.nextImageId = 1;
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getSavedImages(): Promise<SavedImage[]> {
    return Array.from(this.images.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async saveImage(image: InsertSavedImage): Promise<SavedImage> {
    const id = this.nextImageId++;
    const saved: SavedImage = {
      ...image,
      id,
      title: image.title ?? null,
      source: image.source ?? null,
      query: image.query ?? null,
      createdAt: new Date(),
    };
    this.images.set(id, saved);
    return saved;
  }

  async deleteSavedImage(id: number): Promise<void> {
    this.images.delete(id);
  }
}

export const storage = new MemStorage();
