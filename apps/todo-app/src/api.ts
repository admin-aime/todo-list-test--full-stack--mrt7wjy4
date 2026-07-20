import type { Task, User } from './types';

const USE_LOCAL = import.meta.env.VITE_USE_LOCAL_STORE === 'true';
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

// ---- Helpers ----

function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

function setToken(token: string): void {
  localStorage.setItem('auth_token', token);
}

function clearToken(): void {
  localStorage.removeItem('auth_token');
}

function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

// ---- Local store helpers ----

function getLocalUsers(): User[] {
  const raw = localStorage.getItem('users');
  return raw ? JSON.parse(raw) : [];
}

function setLocalUsers(users: User[]): void {
  localStorage.setItem('users', JSON.stringify(users));
}

function getLocalTasks(): Task[] {
  const raw = localStorage.getItem('tasks');
  return raw ? JSON.parse(raw) : [];
}

function setLocalTasks(tasks: Task[]): void {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

async function seedLocalIfEmpty(): Promise<void> {
  const tasks = localStorage.getItem('tasks');
  if (!tasks) {
    try {
      const seed = await fetch('/seed.json').then((r) => r.json());
      if (seed.tasks && Array.isArray(seed.tasks)) {
        localStorage.setItem('tasks', JSON.stringify(seed.tasks));
      }
    } catch {
      // ignore
    }
  }
}

// ---- Auth API ----

export interface AuthResponse {
  token: string;
  user: User;
}

export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  if (USE_LOCAL) {
    const users = getLocalUsers();
    if (users.find((u) => u.email === email)) {
      throw new Error('Email already in use');
    }
    const user: User = { id: crypto.randomUUID(), name, email };
    setLocalUsers([...users, user]);
    const token = 'local-token-' + user.id;
    setToken(token);
    return { token, user };
  }

  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Registration failed');
  }
  const data = await res.json();
  setToken(data.token);
  return data;
}

export async function loginUser(
  email: string,
  password: string
): Promise<AuthResponse> {
  if (USE_LOCAL) {
    const users = getLocalUsers();
    const user = users.find((u) => u.email === email);
    if (!user) {
      // Create on the fly for demo
      const newUser: User = { id: crypto.randomUUID(), name: email.split('@')[0], email };
      setLocalUsers([...users, newUser]);
      const token = 'local-token-' + newUser.id;
      setToken(token);
      return { token, user: newUser };
    }
    const token = 'local-token-' + user.id;
    setToken(token);
    return { token, user };
  }

  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Login failed');
  }
  const data = await res.json();
  setToken(data.token);
  return data;
}

export async function getProfile(): Promise<User | null> {
  const token = getToken();
  if (!token) return null;

  if (USE_LOCAL) {
    const userId = token.replace('local-token-', '');
    const users = getLocalUsers();
    return users.find((u) => u.id === userId) || null;
  }

  const res = await fetch(`${API_BASE}/api/auth/profile`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.user;
}

export function logoutUser(): void {
  clearToken();
}

// ---- Tasks API ----

export async function fetchTasks(
  filters?: Partial<{ status: string; priority: string; category: string; search: string; sortBy: string }>
): Promise<Task[]> {
  await seedLocalIfEmpty();

  if (USE_LOCAL) {
    let tasks = getLocalTasks();
    const userId = getToken()?.replace('local-token-', '') || '';

    if (filters?.status === 'active') {
      tasks = tasks.filter((t) => !t.completed);
    } else if (filters?.status === 'completed') {
      tasks = tasks.filter((t) => t.completed);
    }
    if (filters?.priority) {
      tasks = tasks.filter((t) => t.priority === filters.priority);
    }
    if (filters?.category) {
      tasks = tasks.filter((t) => t.category === filters.category);
    }
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      tasks = tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(s) ||
          (t.description && t.description.toLowerCase().includes(s))
      );
    }
    if (filters?.sortBy === 'dueDate') {
      tasks.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
    } else if (filters?.sortBy === 'priority') {
      const pOrder = { high: 0, medium: 1, low: 2 };
      tasks.sort((a, b) => (pOrder[a.priority] ?? 2) - (pOrder[b.priority] ?? 2));
    } else {
      tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return tasks;
  }

  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.priority) params.set('priority', filters.priority);
  if (filters?.category) params.set('category', filters.category);
  if (filters?.search) params.set('search', filters.search);
  if (filters?.sortBy) params.set('sortBy', filters.sortBy);

  const res = await fetch(`${API_BASE}/api/tasks?${params}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch tasks');
  const data = await res.json();
  return data.tasks;
}

export async function createTask(taskData: {
  title: string;
  description?: string;
  priority?: string;
  category?: string;
  dueDate?: string | null;
}): Promise<Task> {
  if (USE_LOCAL) {
    await seedLocalIfEmpty();
    const userId = getToken()?.replace('local-token-', '') || '';
    const now = new Date().toISOString();
    const task: Task = {
      id: crypto.randomUUID(),
      userId,
      title: taskData.title,
      description: taskData.description || null,
      priority: (taskData.priority as Task['priority']) || 'medium',
      category: taskData.category || 'general',
      dueDate: taskData.dueDate || null,
      completed: false,
      createdAt: now,
      updatedAt: now,
    };
    const tasks = getLocalTasks();
    setLocalTasks([task, ...tasks]);
    return task;
  }

  const res = await fetch(`${API_BASE}/api/tasks`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(taskData),
  });
  if (!res.ok) throw new Error('Failed to create task');
  const data = await res.json();
  return data.task;
}

export async function updateTask(
  id: string,
  updates: Partial<{
    title: string;
    description: string | null;
    priority: string;
    category: string;
    dueDate: string | null;
    completed: boolean;
  }>
): Promise<Task> {
  if (USE_LOCAL) {
    const tasks = getLocalTasks();
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error('Task not found');
    tasks[idx] = { ...tasks[idx], ...updates, updatedAt: new Date().toISOString() } as Task;
    setLocalTasks(tasks);
    return tasks[idx];
  }

  const res = await fetch(`${API_BASE}/api/tasks/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update task');
  const data = await res.json();
  return data.task;
}

export async function deleteTask(id: string): Promise<void> {
  if (USE_LOCAL) {
    const tasks = getLocalTasks().filter((t) => t.id !== id);
    setLocalTasks(tasks);
    return;
  }

  const res = await fetch(`${API_BASE}/api/tasks/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete task');
}

export async function toggleTaskComplete(id: string): Promise<Task> {
  if (USE_LOCAL) {
    const tasks = getLocalTasks();
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error('Task not found');
    tasks[idx] = { ...tasks[idx], completed: !tasks[idx].completed, updatedAt: new Date().toISOString() };
    setLocalTasks(tasks);
    return tasks[idx];
  }

  const res = await fetch(`${API_BASE}/api/tasks/${id}/complete`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to toggle task');
  const data = await res.json();
  return data.task;
}
