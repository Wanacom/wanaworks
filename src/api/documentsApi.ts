import apiClient from './client';
import { Document, ApiResponse } from '../types';

export const documentsApi = {
  // Get all documents for a task
  getTaskDocuments: async (taskId: number, type?: string) => {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    
    const response = await apiClient.get<ApiResponse<Document[]>>(`/tasks/${taskId}/documents?${params.toString()}`);
    return response.data.data;
  },
  
  // Get all documents for a work item
  getWorkItemDocuments: async (workItemId: number, type?: string) => {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    
    const response = await apiClient.get<ApiResponse<Document[]>>(`/work-items/${workItemId}/documents?${params.toString()}`);
    return response.data.data;
  },
  
  // Upload a document
  uploadDocument: async (file: File, entityType: 'Task' | 'JobWorkItem', entityId: number, type: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entity_type', entityType);
    formData.append('entity_id', entityId.toString());
    formData.append('type', type);
    
    const response = await apiClient.post<ApiResponse<Document>>('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data.data;
  },
  
  // Mark document as final
  markAsFinal: async (documentId: number) => {
    const response = await apiClient.patch<ApiResponse<Document>>(`/documents/${documentId}/mark-final`);
    return response.data.data;
  },
  
  // Mark document as client approved
  markAsClientApproved: async (documentId: number) => {
    const response = await apiClient.patch<ApiResponse<Document>>(`/documents/${documentId}/approve`);
    return response.data.data;
  },
  
  // Get document by ID
  getDocument: async (id: number) => {
    const response = await apiClient.get<ApiResponse<Document>>(`/documents/${id}`);
    return response.data.data;
  },
  
  // Delete document
  deleteDocument: async (id: number) => {
    await apiClient.delete(`/documents/${id}`);
  }
};

export default documentsApi;