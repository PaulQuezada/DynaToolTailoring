// src/stores.ts
import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import './routes/types.ts';

export const themeStore = writable('Light'); // 'light' es el valor inicial