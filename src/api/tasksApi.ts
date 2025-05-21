import apiClient from './client';
import { Task, PaginatedResponse, ApiResponse, CalendarEvent, MapLocation } from '../types';

export const tasksApi = {
  // Fetch all tasks with pagination
  getTasks: async (page = 1, search?: string, status?: string, isPlanifiable?: boolean) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    if (isPlanifiable !== undefined) params.append('is_planifiable', isPlanifiable.toString());
    
    const response = await apiClient.get<PaginatedResponse<Task>>(`/tasks?${params.toString()}`);
    return response.data;
  },
  
  // Get tasks for a specific work item
  getWorkItemTasks: async (workItemId: number) => {
    const response = await apiClient.get<ApiResponse<Task[]>>(`/work-items/${workItemId}/tasks`);
    return response.data.data;
  },
  
  // Get a specific task by ID
  getTask: async (id: number) => {
    const response = await apiClient.get<ApiResponse<Task>>(`/tasks/${id}`);
    return response.data.data;
  },
  
  // Create a new task
  createTask: async (taskData: Partial<Task>) => {
    const response = await apiClient.post<ApiResponse<Task>>('/tasks', taskData);
    return response.data.data;
  },
  
  // Update an existing task
  updateTask: async (id: number, taskData: Partial<Task>) => {
    const response = await apiClient.put<ApiResponse<Task>>(`/tasks/${id}`, taskData);
    return response.data.data;
  },
  
  // Delete a task
  deleteTask: async (id: number) => {
    await apiClient.delete(`/tasks/${id}`);
  },
  
  // Update task status
  updateTaskStatus: async (id: number, status: string) => {
    const response = await apiClient.patch<ApiResponse<Task>>(`/tasks/${id}/status`, { status });
    return response.data.data;
  },
  
  // Get calendar events
  getCalendarEvents: async (start: string, end: string, workItemCodes?: string[]) => {
    const params = new URLSearchParams();
    params.append('start', start);
    params.append('end', end);
    
    if (workItemCodes && workItemCodes.length > 0) {
      workItemCodes.forEach(code => params.append('work_item_codes[]', code));
    }
    
    const response = await apiClient.get<ApiResponse<CalendarEvent[]>>(`/tasks/calendar?${params.toString()}`);
    return response.data.data;
  },
  
  // Get map locations for planifiable tasks
  getMapLocations: async () => {
    const response = await apiClient.get<ApiResponse<MapLocation[]>>('/tasks/map-locations');
    return response.data.data;
  },
  
  // Add duration to a task
  addTaskDuration: async (taskId: number, minutes: number, note?: string) => {
    const response = await apiClient.post<ApiResponse<Task>>(`/tasks/${taskId}/durations`, {
      minutes,
      note
    });
    return response.data.data;
  },
  
  // Generate worksheet for a task
  generateWorksheet: async (taskId: number) => {
    const response = await apiClient.post<ApiResponse<{ document_id: number, file_url: string }>>(
      `/tasks/${taskId}/generate-worksheet`
    );
    return response.data.data;
  }
};

export default tasksApi;