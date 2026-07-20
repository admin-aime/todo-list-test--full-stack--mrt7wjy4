export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high';
  category: string;
  dueDate: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TaskFilters = {
  status: 'all' | 'active' | 'completed';
  priority: string;
  category: string;
  search: string;
  sortBy: 'createdAt' | 'dueDate' | 'priority';
};
