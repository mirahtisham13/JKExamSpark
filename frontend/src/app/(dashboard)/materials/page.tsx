"use client";

import React, { useState } from 'react';
import { Search, Download, ExternalLink, FileText, ImageIcon, Filter } from 'lucide-react';
import { useMaterials, useDownloadMaterial } from '@/hooks/useMaterials';
import { useExams, useSubjects, useTopics } from '@/hooks/useTaxonomy';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { toast } from 'react-hot-toast';

export default function StudentMaterialsPage() {
  const [filters, setFilters] = useState({
    exam_id: undefined as string | undefined,
    subject_id: undefined as string | undefined,
    topic_id: undefined as string | undefined,
    search: '',
  });

  const { data: materials, isLoading: materialsLoading } = useMaterials(filters);
  const { data: exams, isLoading: examsLoading } = useExams();
  const { data: subjects, isLoading: subjectsLoading } = useSubjects(filters.exam_id);
  const { data: topics, isLoading: topicsLoading } = useTopics(filters.subject_id);
  
  const { mutateAsync: downloadMaterial } = useDownloadMaterial();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (id: string) => {
    try {
      setDownloadingId(id);
      const res = await downloadMaterial(id);
      if (res.url) {
        window.open(res.url, '_blank');
      }
    } catch (error) {
      toast.error("Failed to open material");
    } finally {
      setDownloadingId(null);
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'PDF': return <FileText className="h-8 w-8 text-red-500 mb-3" />;
      case 'VIDEO': return <ImageIcon className="h-8 w-8 text-blue-500 mb-3" />;
      case 'LINK': return <ExternalLink className="h-8 w-8 text-green-500 mb-3" />;
      default: return <FileText className="h-8 w-8 text-gray-500 mb-3" />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 min-h-screen">
      
      {/* Sidebar Filters */}
      <div className="w-full md:w-64 space-y-6 flex-shrink-0">
        <div className="bg-card-light dark:bg-card-dark p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm sticky top-6">
          <div className="flex items-center space-x-2 mb-4 text-lg font-bold">
            <Filter className="w-5 h-5 text-primary" />
            <h2>Filters</h2>
          </div>
          
          <div className="space-y-4">
            <Select 
              label="Exam" 
              value={filters.exam_id || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, exam_id: e.target.value || undefined, subject_id: undefined, topic_id: undefined }))}
              options={exams ? [{label: 'All Exams', value: ''}, ...exams.map(e => ({ label: e.name, value: e.id }))] : []}
            />
            
            <Select 
              label="Subject" 
              value={filters.subject_id || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, subject_id: e.target.value || undefined, topic_id: undefined }))}
              options={subjects ? [{label: 'All Subjects', value: ''}, ...subjects.map(s => ({ label: s.name, value: s.id }))] : []}
              disabled={!filters.exam_id || subjectsLoading}
            />

            <Select 
              label="Topic" 
              value={filters.topic_id || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, topic_id: e.target.value || undefined }))}
              options={topics ? [{label: 'All Topics', value: ''}, ...topics.map(t => ({ label: t.name, value: t.id }))] : []}
              disabled={!filters.subject_id || topicsLoading}
            />
            
            <Button 
              variant="outline" 
              className="w-full mt-2"
              onClick={() => setFilters({ exam_id: undefined, subject_id: undefined, topic_id: undefined, search: '' })}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Study Materials</h1>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search materials..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition-shadow"
            />
          </div>
        </div>

        {materialsLoading ? (
          <div className="flex justify-center items-center py-20"><Spinner size="lg" /></div>
        ) : !materials || materials.length === 0 ? (
          <EmptyState 
            icon="search" 
            title="No materials found" 
            description="Try adjusting your filters or search query to find what you're looking for." 
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {materials.map((mat) => (
              <div 
                key={mat.id} 
                className="group flex flex-col bg-card-light dark:bg-card-dark rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                <div className="p-5 flex-1">
                  <div className="flex justify-between items-start">
                    {getIconForType(mat.material_type)}
                    <Badge variant={mat.material_type === 'PDF' ? 'red' : mat.material_type === 'LINK' ? 'green' : 'blue'}>
                      {mat.material_type}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-lg leading-tight mb-2 text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors line-clamp-2">
                    {mat.title}
                  </h3>
                  {mat.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                      {mat.description}
                    </p>
                  )}
                  
                  <div className="flex items-center text-xs text-gray-500 mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                    <Download className="w-3 h-3 mr-1" />
                    {mat.download_count} {mat.download_count === 1 ? 'download' : 'downloads'}
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50">
                  <Button 
                    className="w-full" 
                    variant={mat.material_type === 'LINK' ? 'secondary' : 'primary'}
                    isLoading={downloadingId === mat.id}
                    onClick={() => handleDownload(mat.id)}
                  >
                    {mat.material_type === 'LINK' ? (
                      <><ExternalLink className="w-4 h-4 mr-2" /> Open Link</>
                    ) : (
                      <><Download className="w-4 h-4 mr-2" /> Download</>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
