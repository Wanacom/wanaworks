import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, ListTodo, BarChart2, Users, FileText } from 'lucide-react';
import { tasksApi } from '../api/tasksApi';
import { jobsApi } from '../api/jobsApi';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // Fetch today's tasks
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const nextDayStr = new Date(today.setDate(today.getDate() + 1)).toISOString().split('T')[0];
  
  const { data: todayEvents, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['calendarEvents', todayStr],
    queryFn: () => tasksApi.getCalendarEvents(todayStr, nextDayStr),
  });
  
  // Fetch active jobs
  const { data: activeJobs, isLoading: isLoadingJobs } = useQuery({
    queryKey: ['jobs', 'active'],
    queryFn: () => jobsApi.getJobs(1, undefined, 'active'),
  });
  
  // Stats cards
  const stats = [
    { name: 'Active Jobs', value: activeJobs?.meta?.total || 0, icon: Briefcase, color: 'bg-blue-500' },
    { name: "Today's Tasks", value: todayEvents?.length || 0, icon: Calendar, color: 'bg-green-500' },
    { name: 'Tasks in Progress', value: 12, icon: Clock, color: 'bg-yellow-500' },
    { name: 'Tasks Completed', value: 45, icon: ListTodo, color: 'bg-purple-500' },
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex space-x-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <span className="w-2 h-2 mr-1 bg-green-500 rounded-full"></span>
            System Online
          </span>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white overflow-hidden shadow rounded-lg transition-all duration-300 hover:shadow-md"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{stat.value}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  View all
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Two Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Today's Schedule */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Today's Schedule</h2>
            <button
              onClick={() => navigate('/calendar')}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              View calendar
            </button>
          </div>
          <div className="p-5">
            {isLoadingEvents ? (
              <div className="py-10 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : todayEvents && todayEvents.length > 0 ? (
              <div className="flow-root">
                <ul className="-my-5 divide-y divide-gray-200">
                  {todayEvents.slice(0, 5).map((event) => (
                    <li key={event.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className={`w-10 h-10 rounded-md flex items-center justify-center ${
                            event.backgroundColor || 'bg-blue-500'
                          }`}>
                            <Calendar className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {event.title}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {new Date(event.start).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })} - {new Date(event.end).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                        <div>
                          <button
                            onClick={() => navigate(`/tasks/${event.extendedProps.task.id}`)}
                            className="inline-flex items-center shadow-sm px-2.5 py-0.5 border border-gray-300 text-sm leading-5 font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-center py-10">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks scheduled</h3>
                <p className="mt-1 text-sm text-gray-500">Your schedule for today is clear.</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Latest Jobs */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Latest Jobs</h2>
            <button
              onClick={() => navigate('/jobs')}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              View all
            </button>
          </div>
          <div className="p-5">
            {isLoadingJobs ? (
              <div className="py-10 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : activeJobs && activeJobs.data.length > 0 ? (
              <div className="flow-root">
                <ul className="-my-5 divide-y divide-gray-200">
                  {activeJobs.data.slice(0, 5).map((job) => (
                    <li key={job.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-md bg-blue-500 flex items-center justify-center">
                            <Briefcase className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {job.title}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {job.client?.name} • Ref: {job.reference}
                          </p>
                        </div>
                        <div>
                          <button
                            onClick={() => navigate(`/jobs/${job.id}`)}
                            className="inline-flex items-center shadow-sm px-2.5 py-0.5 border border-gray-300 text-sm leading-5 font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-center py-10">
                <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No active jobs</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new job.</p>
                <div className="mt-6">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    New Job
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Activity Feed */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-5">
          <div className="flow-root">
            <ul className="-mb-8">
              {[1, 2, 3, 4, 5].map((activity, idx) => (
                <li key={idx}>
                  <div className="relative pb-8">
                    {idx !== 4 ? (
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
                            Generated worksheet for Task #{12345}
                          </p>
                        </div>
                        <div className="mt-2 text-sm text-gray-700">
                          <p>Worksheet #WS-12345 has been created and marked as final.</p>
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
    </div>
  );
};

export default Dashboard;