import apiClient from './client';
import { Job, PaginatedResponse, ApiResponse, JobWorkItem } from '../types';

export const jobsApi = {
  // Fetch all jobs with pagination
  getJobs: async (page = 1, search?: string, status?: string, clientId?: number) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    if (clientId) params.append('client_id', clientId.toString());
    
    const response = await apiClient.get<PaginatedResponse<Job>>(`/jobs?${params.toString()}`);
    return response.data;
  },
  
  // Get a specific job by ID
  getJob: async (id: number) => {
    const response = await apiClient.get<ApiResponse<Job>>(`/jobs/${id}`);
    return response.data.data;
  },
  
  // Create a new job
  createJob: async (jobData: Partial<Job>) => {
    const response = await apiClient.post<ApiResponse<Job>>('/jobs', jobData);
    return response.data.data;
  },
  
  // Update an existing job
  updateJob: async (id: number, jobData: Partial<Job>) => {
    const response = await apiClient.put<ApiResponse<Job>>(`/jobs/${id}`, jobData);
    return response.data.data;
  },
  
  // Delete a job
  deleteJob: async (id: number) => {
    await apiClient.delete(`/jobs/${id}`);
  },
  
  // Get all work items for a job
  getJobWorkItems: async (jobId: number) => {
    const response = await apiClient.get<ApiResponse<JobWorkItem[]>>(`/jobs/${jobId}/work-items`);
    return response.data.data;
  },
  
  // Add work items to a job
  addWorkItemsToJob: async (jobId: number, workItemCodes: string[]) => {
    const response = await apiClient.post<ApiResponse<JobWorkItem[]>>(
      `/jobs/${jobId}/work-items`,
      { work_item_codes: workItemCodes }
    );
    return response.data.data;
  },
  
  // Update work item order
  updateWorkItemOrder: async (jobId: number, workItemIds: number[]) => {
    const response = await apiClient.put<ApiResponse<JobWorkItem[]>>(
      `/jobs/${jobId}/work-items/order`,
      { work_item_ids: workItemIds }
    );
    return response.data.data;
  },
  
  // Update work item custom fields
  updateWorkItemCustomFields: async (workItemId: number, customFields: Record<string, any>) => {
    const response = await apiClient.put<ApiResponse<JobWorkItem>>(
      `/work-items/${workItemId}/custom-fields`,
      { custom_fields: customFields }
    );
    return response.data.data;
  }
};

export default jobsApi;