export type Role = 'Admin' | 'Manager' | 'Planner' | 'Tech' | 'Sales';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface Client {
  id: number;
  name: string;
  billing_address: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: number;
  client_id: number;
  reference: string;
  title: string;
  description?: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
  client?: Client;
  work_items?: JobWorkItem[];
}

export interface WorkItemCode {
  code: string;
  label: string;
  default_color: string;
}

export interface WorkItemModel {
  id: number;
  code: string;
  label: string;
  tasks?: WorkItemModelTask[];
}

export interface WorkItemModelTask {
  id: number;
  model_id: number;
  task_type: string;
  order: number;
  description?: string;
}

export interface JobWorkItem {
  id: number;
  job_id: number;
  code: string;
  order: number;
  custom_fields: Record<string, any>;
  created_at: string;
  updated_at: string;
  tasks?: Task[];
}

export type TaskStatus = 'draft' | 'ready' | 'in_progress' | 'blocked' | 'completed' | 'archived';

export interface Task {
  id: number;
  job_work_item_id: number;
  type: string;
  title: string;
  description?: string;
  status: TaskStatus;
  is_planifiable: boolean;
  start_at?: string;
  end_at?: string;
  site_address?: string;
  travel_time_to?: number;
  travel_time_back?: number;
  created_at: string;
  updated_at: string;
  job_work_item?: JobWorkItem;
  documents?: Document[];
  durations?: Duration[];
}

export interface Document {
  id: number;
  type: 'worksheet' | 'proof' | 'invoice' | 'other';
  file_path: string;
  is_current: boolean;
  is_final: boolean;
  is_client_approved: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
  created_by_user?: User;
}

export interface DocumentLink {
  id: number;
  document_id: number;
  entity_type: 'Task' | 'JobWorkItem';
  entity_key: number;
  created_at: string;
  document?: Document;
}

export interface Duration {
  id: number;
  task_id: number;
  user_id: number;
  minutes: number;
  note?: string;
  created_at: string;
  user?: User;
}

export interface AuditLog {
  id: number;
  entity_type: string;
  entity_id: number;
  action: string;
  user_id: number;
  previous_value?: string;
  new_value?: string;
  created_at: string;
  user?: User;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  extendedProps: {
    task: Task;
  };
}

export interface MapLocation {
  id: number;
  title: string;
  address: string;
  lat: number;
  lng: number;
  taskId: number;
  color?: string;
  travelTimeTo?: number;
  travelTimeBack?: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}