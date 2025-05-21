import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Briefcase, Building, CheckCircle, Clock, ClipboardList, FileText, ListOrdered as ListReorder, Plus, Trash2, CalendarDays, Edit, ExternalLink, AlertTriangle, MoreHorizontal, MapPin } from 'lucide-react';
import { jobsApi } from '../../api/jobsApi';
import { tasksApi } from '../../api/tasksApi';
import { documentsApi } from '../../api/documentsApi';
import { Job, JobWorkItem, Task, Document } from '../../types';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

enum TabType {
  Overview = 'overview',
  WorkItems = 'workItems',
  Documents = 'documents'
}

const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const jobId = parseInt(id || '0', 10);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<TabType>(TabType.Overview);
  const [isReordering, setIsReordering] = useState(false);
  const [workItemOrder, setWorkItemOrder] = useState<number[]>([]);
  
  // Fetch job details
  const { 
    data: job, 
    isLoading, 
    isError,
    error 
  } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => jobsApi.getJob(jobId),
    enabled: jobId > 0,
  });
  
  // Fetch job work items
  const { 
    data: workItems,
    isLoading: isLoadingWorkItems 
  } = useQuery({
    queryKey: ['jobWorkItems', jobId],
    queryFn: () => jobsApi.getJobWorkItems(jobId),
    enabled: jobId > 0,
    onSuccess: (data) => {
      setWorkItemOrder(data.map(item => item.id));
    }
  });
  
  // Update job status mutation
  const updateJobStatusMutation = useMutation({
    mutationFn: (status: string) => jobsApi.updateJob(jobId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job', jobId] });
      toast.success('Job status updated successfully');
    },
    onError: () => {
      toast.error('Failed to update job status');
    }
  });
  
  // Update work item order mutation
  const updateWorkItemOrderMutation = useMutation({
    mutationFn: (workItemIds: number[]) => jobsApi.updateWorkItemOrder(jobId, workItemIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobWorkItems', jobId] });
      setIsReordering(false);
      toast.success('Work item order updated');
    },
    onError: () => {
      toast.error('Failed to update work item order');
    }
  });
  
  // Handle work item drag and drop
  const handleDragStart = (e: React.DragEvent, itemId: number) => {
    e.dataTransfer.setData('itemId', itemId.toString());
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent, targetItemId: number) => {
    e.preventDefault();
    const sourceItemId = parseInt(e.dataTransfer.getData('itemId'), 10);
    if (sourceItemId === targetItemId) return;
    
    const sourceIndex = workItemOrder.indexOf(sourceItemId);
    const targetIndex = workItemOrder.indexOf(targetItemId);
    
    const newOrder = [...workItemOrder];
    newOrder.splice(sourceIndex, 1);
    newOrder.splice(targetIndex, 0, sourceItemId);
    
    setWorkItemOrder(newOrder);
  };
  
  const saveWorkItemOrder = () => {
    updateWorkItemOrderMutation.mutate(workItemOrder);
  };
  
  // Cancel reordering
  const cancelReordering = () => {
    if (workItems) {
      setWorkItemOrder(workItems.map(item => item.id));
    }
    setIsReordering(false);
  };
  
  // Determine if user can edit job
  const canEditJob = user && ['Admin', 'Manager', 'Sales'].includes(user.role);
  
  // Get status badge style
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'archived':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Handle status change
  const handleStatusChange = (status: string) => {
    updateJobStatusMutation.mutate(status);
  };
  
  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <AlertTriangle className="h-16 w-16 text-amber-500" />
        <h3 className="mt-2 text-xl font-medium text-gray-900">Error loading job</h3>
        <p className="mt-1 text-sm text-gray-500">
          {error instanceof Error ? error.message : 'An unexpected error occurred'}
        </p>
        <div className="mt-6 flex space-x-4">
          <button
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => navigate('/jobs')}
          >
            <ChevronLeft className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Back to Jobs
          </button>
          <button
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['job', jobId] })}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  if (!job) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <Briefcase className="h-16 w-16 text-gray-400" />
        <h3 className="mt-2 text-xl font-medium text-gray-900">Job not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The job you're looking for doesn't exist or you don't have access to it.
        </p>
        <button
          className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={() => navigate('/jobs')}
        >
          <ChevronLeft className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Back to Jobs
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Back button and title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center">
          <button
            type="button"
            className="mr-4 text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={() => navigate('/jobs')}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div>
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
              <span className={`ml-3 px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeStyle(job.status)}`}>
                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Reference: {job.reference} | Created: {new Date(job.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        {canEditJob && (
          <div className="flex items-center mt-4 sm:mt-0 space-x-3">
            <div className="relative">
              <select
                id="job-status"
                className="mt-1 block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={job.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updateJobStatusMutation.isPending}
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
              onClick={() => navigate(`/jobs/${jobId}/edit`)}
            >
              <Edit className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Edit Job
            </button>
          </div>
        )}
      </div>
      
      {/* Client information */}
      {job.client && (
        <div className="bg-white shadow rounded-lg px-5 py-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Building className="h-5 w-5 text-gray-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Client Information</h3>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="mt-1 text-sm text-gray-900">{job.client.name}</p>
                </div>
                {job.client.contact_name && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Contact</p>
                    <p className="mt-1 text-sm text-gray-900">{job.client.contact_name}</p>
                  </div>
                )}
                {job.client.contact_email && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="mt-1 text-sm text-gray-900">{job.client.contact_email}</p>
                  </div>
                )}
                {job.client.contact_phone && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="mt-1 text-sm text-gray-900">{job.client.contact_phone}</p>
                  </div>
                )}
                <div className="sm:col-span-2">
                  <p className="text-sm font-medium text-gray-500">Billing Address</p>
                  <p className="mt-1 text-sm text-gray-900">{job.client.billing_address}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Tabs */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === TabType.Overview
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab(TabType.Overview)}
            >
              Overview
            </button>
            <button
              className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === TabType.WorkItems
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab(TabType.WorkItems)}
            >
              Work Items
            </button>
            <button
              className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === TabType.Documents
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab(TabType.Documents)}
            >
              Documents
            </button>
          </nav>
        </div>
        
        {/* Tab content */}
        <div className="p-5">
          {/* Overview Tab */}
          {activeTab === TabType.Overview && (
            <div className="space-y-6">
              {/* Job Description */}
              <div>
                <h3 className="text-lg font-medium text-gray-900">Description</h3>
                <div className="mt-2 p-4 bg-gray-50 rounded-md">
                  {job.description ? (
                    <p className="text-sm text-gray-800">{job.description}</p>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No description provided</p>
                  )}
                </div>
              </div>
              
              {/* Job Summary Stats */}
              <div>
                <h3 className="text-lg font-medium text-gray-900">Job Summary</h3>
                <dl className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-3">
                  <div className="px-4 py-5 bg-gray-50 shadow-sm rounded-lg overflow-hidden">
                    <dt className="text-sm font-medium text-gray-500 truncate">Work Items</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      {job.work_items?.length || 0}
                    </dd>
                  </div>
                  <div className="px-4 py-5 bg-gray-50 shadow-sm rounded-lg overflow-hidden">
                    <dt className="text-sm font-medium text-gray-500 truncate">Tasks</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      {/* Calculate total tasks from all work items */}
                      {job.work_items?.reduce((acc, item) => acc + (item.tasks?.length || 0), 0) || 0}
                    </dd>
                  </div>
                  <div className="px-4 py-5 bg-gray-50 shadow-sm rounded-lg overflow-hidden">
                    <dt className="text-sm font-medium text-gray-500 truncate">Status</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </dd>
                  </div>
                </dl>
              </div>
              
              {/* Recent Activities */}
              <div>
                <h3 className="text-lg font-medium text-gray-900">Recent Activities</h3>
                <div className="mt-2 flow-root">
                  <ul className="-mb-8">
                    {/* We would normally fetch this data from the API */}
                    {[1, 2, 3].map((_, index) => (
                      <li key={index}>
                        <div className="relative pb-8">
                          {index < 2 ? (
                            <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                          ) : null}
                          <div className="relative flex items-start space-x-3">
                            <div>
                              <div className="relative px-1">
                                <div className="h-8 w-8 bg-blue-500 rounded-full ring-8 ring-white flex items-center justify-center">
                                  <FileText className="h-5 w-5 text-white" aria-hidden="true" />
                                </div>
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div>
                                <div className="text-sm">
                                  <a href="#" className="font-medium text-gray-900">
                                    John Doe
                                  </a>
                                </div>
                                <p className="mt-0.5 text-sm text-gray-500">
                                  {index === 0 ? 'Generated worksheet' : index === 1 ? 'Updated task status' : 'Added new work item'}
                                </p>
                              </div>
                              <div className="mt-2 text-sm text-gray-700">
                                <p>{index === 0 ? 'Worksheet has been generated and marked as final.' : 
                                   index === 1 ? 'Changed status from "In Progress" to "Completed".' : 
                                   'Added Covering work item to the job.'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {/* Work Items Tab */}
          {activeTab === TabType.WorkItems && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Work Items</h3>
                
                <div className="flex space-x-3">
                  {canEditJob && !isReordering && (
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                      onClick={() => navigate(`/jobs/${jobId}/work-items/add`)}
                    >
                      <Plus className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
                      Add Work Items
                    </button>
                  )}
                  
                  {canEditJob && !isReordering && workItems && workItems.length > 1 && (
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                      onClick={() => setIsReordering(true)}
                    >
                      <ListReorder className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
                      Reorder
                    </button>
                  )}
                  
                  {isReordering && (
                    <>
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                        onClick={saveWorkItemOrder}
                        disabled={updateWorkItemOrderMutation.isPending}
                      >
                        {updateWorkItemOrderMutation.isPending ? (
                          <>
                            <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
                            Save Order
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                        onClick={cancelReordering}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              {isLoadingWorkItems ? (
                <div className="py-10 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : workItems && workItems.length > 0 ? (
                <div className="space-y-4">
                  {workItemOrder.map(itemId => {
                    const item = workItems.find(wi => wi.id === itemId);
                    if (!item) return null;
                    
                    return (
                      <div
                        key={item.id}
                        className={`bg-white border rounded-lg shadow-sm transition-all duration-150 ${
                          isReordering 
                            ? 'border-dashed border-gray-400 cursor-move' 
                            : 'border-gray-200 hover:shadow-md'
                        }`}
                        draggable={isReordering}
                        onDragStart={isReordering ? (e) => handleDragStart(e, item.id) : undefined}
                        onDragOver={isReordering ? handleDragOver : undefined}
                        onDrop={isReordering ? (e) => handleDrop(e, item.id) : undefined}
                      >
                        <div className="px-4 py-5 sm:p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              {isReordering && (
                                <div className="mr-3 text-gray-400">
                                  <ListReorder className="h-5 w-5" />
                                </div>
                              )}
                              <div>
                                <h4 className="text-lg font-medium text-gray-900">
                                  {item.code}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  {item.tasks?.length || 0} tasks
                                </p>
                              </div>
                            </div>
                            
                            {!isReordering && (
                              <div className="flex items-center space-x-3">
                                <button
                                  type="button"
                                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                                  onClick={() => navigate(`/work-items/${item.id}`)}
                                >
                                  View Details
                                </button>
                                
                                {canEditJob && (
                                  <button
                                    type="button"
                                    className="p-1 text-gray-400 hover:text-gray-500 focus:outline-none"
                                  >
                                    <MoreHorizontal className="h-5 w-5" />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {/* Custom fields */}
                          {Object.keys(item.custom_fields || {}).length > 0 && (
                            <div className="mt-4 border-t border-gray-200 pt-4">
                              <h5 className="text-sm font-medium text-gray-500">Custom Fields</h5>
                              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {Object.entries(item.custom_fields).map(([key, value]) => (
                                  <div key={key}>
                                    <dt className="text-xs font-medium text-gray-500 capitalize">
                                      {key.replace(/_/g, ' ')}
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900">{value as string}</dd>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Tasks */}
                          {item.tasks && item.tasks.length > 0 && !isReordering && (
                            <div className="mt-4 border-t border-gray-200 pt-4">
                              <h5 className="text-sm font-medium text-gray-500">Tasks</h5>
                              <ul className="mt-2 divide-y divide-gray-200">
                                {item.tasks.slice(0, 3).map((task) => (
                                  <li key={task.id} className="py-3 flex items-center justify-between">
                                    <div className="flex items-center">
                                      <div className={`w-2 h-2 rounded-full ${
                                        task.status === 'completed' 
                                          ? 'bg-green-500' 
                                          : task.status === 'in_progress' 
                                          ? 'bg-blue-500'
                                          : task.status === 'blocked'
                                          ? 'bg-red-500'
                                          : 'bg-gray-400'
                                      }`} />
                                      <span className="ml-2 text-sm font-medium text-gray-900">{task.title}</span>
                                      {task.is_planifiable && (
                                        <MapPin className="ml-2 h-4 w-4 text-gray-400" />
                                      )}
                                    </div>
                                    <button
                                      className="ml-2 text-blue-600 text-sm hover:text-blue-800 transition-colors duration-150"
                                      onClick={() => navigate(`/tasks/${task.id}`)}
                                    >
                                      View
                                    </button>
                                  </li>
                                ))}
                                {item.tasks.length > 3 && (
                                  <li className="py-3 text-center">
                                    <button
                                      className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-150"
                                      onClick={() => navigate(`/work-items/${item.id}`)}
                                    >
                                      View all {item.tasks.length} tasks
                                    </button>
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-10 text-center">
                  <ClipboardList className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No work items</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by adding a work item to this job.</p>
                  {canEditJob && (
                    <div className="mt-6">
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                        onClick={() => navigate(`/jobs/${jobId}/work-items/add`)}
                      >
                        <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                        Add Work Item
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Documents Tab */}
          {activeTab === TabType.Documents && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Documents</h3>
                
                {canEditJob && (
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                    onClick={() => console.log('Upload document')}
                  >
                    <Plus className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
                    Upload Document
                  </button>
                )}
              </div>
              
              {/* Document categories */}
              <div className="space-y-4">
                {['worksheet', 'proof', 'invoice', 'other'].map((type) => (
                  <div key={type} className="bg-white border rounded-lg border-gray-200 shadow-sm">
                    <div className="px-4 py-5 sm:p-6">
                      <h4 className="text-lg font-medium text-gray-900 capitalize">
                        {type === 'other' ? 'Other Documents' : `${type}s`}
                      </h4>
                      
                      {/* Document list would normally come from the API */}
                      {type === 'worksheet' ? (
                        <div className="mt-4 divide-y divide-gray-200">
                          {[
                            { id: 1, filename: 'Worksheet_001.pdf', is_final: true, is_client_approved: false, created_at: '2025-05-10' },
                            { id: 2, filename: 'Worksheet_002.pdf', is_final: false, is_client_approved: false, created_at: '2025-05-11' }
                          ].map((doc) => (
                            <div key={doc.id} className="py-3 flex items-center justify-between">
                              <div className="flex items-center">
                                <FileText className="h-5 w-5 text-gray-400" />
                                <span className="ml-2 text-sm font-medium text-gray-900">{doc.filename}</span>
                                {doc.is_final && (
                                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                    Final
                                  </span>
                                )}
                                {doc.is_client_approved && (
                                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                    Client Approved
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-3">
                                <span className="text-xs text-gray-500">
                                  {doc.created_at}
                                </span>
                                <div className="flex space-x-2">
                                  <button
                                    type="button"
                                    className="p-1 text-gray-400 hover:text-gray-500 focus:outline-none"
                                  >
                                    <ExternalLink className="h-5 w-5" />
                                  </button>
                                  {canEditJob && !doc.is_final && (
                                    <button
                                      type="button"
                                      className="p-1 text-gray-400 hover:text-gray-500 focus:outline-none"
                                    >
                                      <CheckCircle className="h-5 w-5" />
                                    </button>
                                  )}
                                  {canEditJob && !doc.is_client_approved && doc.is_final && (
                                    <button
                                      type="button"
                                      className="p-1 text-gray-400 hover:text-gray-500 focus:outline-none"
                                    >
                                      <CheckCircle className="h-5 w-5" />
                                    </button>
                                  )}
                                  {canEditJob && (
                                    <button
                                      type="button"
                                      className="p-1 text-gray-400 hover:text-red-500 focus:outline-none"
                                    >
                                      <Trash2 className="h-5 w-5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-10 text-center">
                          <FileText className="mx-auto h-12 w-12 text-gray-400" />
                          <h3 className="mt-2 text-sm font-medium text-gray-900">No {type} documents</h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {type === 'proof' 
                              ? 'Upload proof documents for client approval.'
                              : type === 'invoice'
                              ? 'Generate invoices for this job.'
                              : 'Upload additional documents related to this job.'}
                          </p>
                          {canEditJob && (
                            <div className="mt-6">
                              <button
                                type="button"
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                              >
                                <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                                {type === 'worksheet' 
                                  ? 'Generate Worksheet'
                                  : type === 'proof'
                                  ? 'Upload Proof'
                                  : type === 'invoice'
                                  ? 'Generate Invoice'
                                  : 'Upload Document'}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetail;