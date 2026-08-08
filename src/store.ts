import { Module, Message } from './types';

const MODULES_KEY = 'learnarena_modules';
const API_KEY_KEY = 'learnarena_openrouter_key';
const ONBOARDED_KEY = 'learnarena_onboarded';

// --- Modules ---

export function getModules(): Module[] {
  try {
    const raw = localStorage.getItem(MODULES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveModules(modules: Module[]): void {
  localStorage.setItem(MODULES_KEY, JSON.stringify(modules));
}

export function getModule(id: string): Module | undefined {
  return getModules().find((m) => m.id === id);
}

export function addModule(module: Module): void {
  const modules = getModules();
  modules.push(module);
  saveModules(modules);
}

export function updateModule(id: string, partial: Partial<Module>): void {
  const modules = getModules();
  const idx = modules.findIndex((m) => m.id === id);
  if (idx === -1) return;
  modules[idx] = { ...modules[idx], ...partial };
  saveModules(modules);
}

export function deleteModule(id: string): void {
  const modules = getModules().filter((m) => m.id !== id);
  saveModules(modules);
}

// --- Tutor History ---

export function getTutorHistory(moduleId: string): Message[] {
  const mod = getModule(moduleId);
  return mod?.tutorHistory ?? [];
}

export function addTutorMessage(moduleId: string, msg: Message): void {
  const modules = getModules();
  const idx = modules.findIndex((m) => m.id === moduleId);
  if (idx === -1) return;
  modules[idx].tutorHistory = [...(modules[idx].tutorHistory ?? []), msg];
  saveModules(modules);
}

// --- Onboarding ---

export function getOnboardedFlag(): boolean {
  return localStorage.getItem(ONBOARDED_KEY) === 'true';
}

export function setOnboardedFlag(): void {
  localStorage.setItem(ONBOARDED_KEY, 'true');
}

// --- API Key ---

export function getApiKey(): string | null {
  return localStorage.getItem(API_KEY_KEY);
}

export function setApiKey(key: string): void {
  localStorage.setItem(API_KEY_KEY, key);
}

export function removeApiKey(): void {
  localStorage.removeItem(API_KEY_KEY);
}