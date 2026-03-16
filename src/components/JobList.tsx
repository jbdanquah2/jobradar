'use client';

import { useState, useEffect } from 'react';
import { updateJobStatus, triggerIngestion } from '@/app/actions';
import { Building, MapPin, ExternalLink, Bookmark, CheckCircle, XCircle, RefreshCw, ChevronLeft, ChevronRight, Search, Filter, Calendar, Globe, Plane } from 'lucide-react';
import Link from 'next/link';

function DateDisplay({ date }: { date: Date | string }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <span className="text-gray-300">...</span>;
  }

  const d = new Date(date);
  return (
    <span suppressHydrationWarning>
      {d.toLocaleDateString()} at {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </span>
  );
}

export default function JobList({ 
  initialJobs, 
  currentStatus, 
  currentPage, 
  totalPages 
}: { 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialJobs: any[], 
  currentStatus: string,
  currentPage: number,
  totalPages: number
}) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isIngesting, setIsIngesting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [frontendOnly, setFrontendOnly] = useState(false);
  const [germanyOnly, setGermanyOnly] = useState(false);
  const [selectedSource, setSelectedSource] = useState('All Sources');
  const [isComponentMounted, setIsComponentMounted] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedJob, setSelectedJob] = useState<any | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsComponentMounted(true);
  }, []);

  const sources = ['All Sources', ...Array.from(new Set(initialJobs.map(job => job.source)))];

  const handleStatusChange = async (id: string, status: string) => {
    setLoadingId(id);
    await updateJobStatus(id, status);
    setLoadingId(null);
  };

  const handleIngest = async () => {
    setIsIngesting(true);
    await triggerIngestion();
    setIsIngesting(false);
  };

  const tabs = ['NEW', 'SAVED', 'APPLIED', 'IGNORED'];

  const filteredJobs = initialJobs.filter(job => {
    const textToMatch = `${job.title} ${job.company} ${job.skills_detected} ${job.description}`.toLowerCase();
    const matchesSearch = textToMatch.includes(searchQuery.toLowerCase());
    const matchesSource = selectedSource === 'All Sources' || job.source === selectedSource;
    
    if (frontendOnly) {
      const isFrontend = /frontend|react|angular|vue|next\.js|nextjs|css|html|ui|ux|frontend engineer|frontend developer/i.test(job.title + " " + job.skills_detected);
      if (!isFrontend) return false;
    }

    if (germanyOnly) {
      const isGermany = /germany|deutschland|berlin|munich|hamburg|frankfurt|cologne|dusseldorf/i.test(job.location_text + " " + job.description);
      if (!isGermany) return false;
    }
    
    return matchesSearch && matchesSource;
  });

  return (
    <div className="space-y-6">
      {/* Top Bar: Navigation and Global Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200 gap-4">
        <nav className="flex bg-gray-100 p-1 rounded-lg w-full lg:w-auto">
          {tabs.map((tab) => (
            <Link 
              key={tab} 
              href={`/?status=${tab}&page=1`}
              className={`flex-1 lg:flex-none px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 text-center ${
                currentStatus === tab 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </Link>
          ))}
        </nav>
        
        <div className="flex items-center justify-between w-full lg:w-auto gap-4">
          {totalPages > 1 && (
            <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
              <Link
                href={`/?status=${currentStatus}&page=${currentPage - 1}`}
                className={`p-1 rounded-md transition-colors ${
                  currentPage <= 1 
                    ? 'pointer-events-none text-gray-300' 
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </Link>
              <span className="text-xs font-bold text-gray-600 mx-3 min-w-[45px] text-center">
                {currentPage} / {totalPages}
              </span>
              <Link
                href={`/?status=${currentStatus}&page=${currentPage + 1}`}
                className={`p-1 rounded-md transition-colors ${
                  currentPage >= totalPages 
                    ? 'pointer-events-none text-gray-300' 
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
          
          <button 
            onClick={handleIngest} 
            disabled={isIngesting}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isIngesting ? 'animate-spin' : ''}`} />
            Fetch Jobs
          </button>
        </div>
      </div>

      {/* Filter Bar: Search and Toggle Filters */}
      <div className="flex flex-col md:flex-row items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search title, company, or tech stack..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border-0 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm placeholder:text-gray-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center bg-white border border-gray-300 rounded-lg px-2 shadow-sm">
            <Filter className="w-3.5 h-3.5 text-gray-400 mr-1" />
            <select 
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="text-xs font-bold py-2 outline-none bg-transparent text-gray-700 min-w-[110px]"
            >
              {sources.map(source => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
          </div>

          <button 
            onClick={() => setFrontendOnly(!frontendOnly)}
            className={`flex-none flex items-center text-xs font-bold px-4 py-2 rounded-lg transition-all border shadow-sm ${
              frontendOnly 
                ? 'bg-blue-100 text-blue-700 border-blue-200 ring-1 ring-blue-300' 
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4 mr-2" />
            Frontend Only
          </button>

          <button 
            onClick={() => setGermanyOnly(!germanyOnly)}
            className={`flex-none flex items-center text-xs font-bold px-4 py-2 rounded-lg transition-all border shadow-sm ${
              germanyOnly 
                ? 'bg-amber-100 text-amber-700 border-amber-200 ring-1 ring-amber-300' 
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Globe className="w-3.5 h-3.5 mr-1.5" />
            Germany Only
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow-sm border border-gray-100">
            {searchQuery || frontendOnly || selectedSource !== 'All Sources' ? "No jobs match your filters." : "No jobs found in this category."}
          </div>
        ) : (
          <>
            <div className="text-xs text-gray-500 mb-2 px-2 flex justify-between">
              <span>Showing {filteredJobs.length} of {initialJobs.length} on this page</span>
            </div>
            {filteredJobs.map((job) => (
              <div key={job.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 leading-tight">{job.title}</h2>
                      <div className="flex items-center mt-2 text-gray-600 space-x-4">
                        <span className="flex items-center text-sm">
                          <Building className="w-4 h-4 mr-1.5" />
                          {job.company}
                        </span>
                        <span className="flex items-center text-sm">
                          <MapPin className="w-4 h-4 mr-1.5" />
                          {job.location_text}
                        </span>
                        <span className="flex items-center text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">
                          {job.source}
                        </span>
                      </div>
                      <div className="flex flex-col mt-2 space-y-1">
                        <div className="flex items-center text-xs text-gray-400">
                          <Calendar className="w-3 h-3 mr-1" />
                          <span>Posted <DateDisplay date={job.date_posted} /></span>
                          <span className="mx-2">•</span>
                          <span>Found <DateDisplay date={job.created_at} /></span>
                        </div>

                        {currentStatus !== 'NEW' && (
                          <div className="flex items-center text-xs text-blue-500 font-medium italic">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {currentStatus.charAt(0) + currentStatus.slice(1).toLowerCase()} 
                            {isComponentMounted && job.status_updated_at && new Date(job.status_updated_at).getTime() !== new Date(job.created_at).getTime() ? (
                              <> on <DateDisplay date={job.status_updated_at} /></>
                            ) : (
                              <> recently</>
                            )}
                          </div>
                        )}
                      </div>
                      </div>
                    <div className="flex flex-col items-end">
                      <div className="flex gap-2">
                        {/relocation|visa sponsorship|visa support|blue card|chancenkarte/i.test(job.description + job.title) && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                            <Plane className="w-3 h-3 mr-1" />
                            Relocation
                          </span>
                        )}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${job.eligibility_status === 'ELIGIBLE' ? 'bg-green-100 text-green-800 border border-green-200' : 
                            job.eligibility_status === 'REJECTED' ? 'bg-red-100 text-red-800 border border-red-200' : 
                            'bg-yellow-100 text-yellow-800 border border-yellow-200'}
                        `}>
                          {job.eligibility_status}
                        </span>
                      </div>
                      <div className="group relative mt-2 text-right">
                        <span className="text-sm font-semibold text-blue-600 cursor-help border-b border-dotted border-blue-300 pb-0.5">Score: {job.match_score}</span>
                        <div className="absolute right-0 top-6 w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                          Based on skills match, location, seniority, and startup signals.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {JSON.parse(job.skills_detected).map((skill: string, idx: number) => (
                      <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 min-w-[140px]">
                  <a 
                    href={job.apply_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex justify-center items-center px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Apply
                  </a>

                  <button 
                    onClick={() => setSelectedJob(job)}
                    className="flex justify-center items-center px-4 py-2 bg-white text-blue-700 border border-blue-300 text-sm font-bold rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Details
                  </button>
                  
                  {currentStatus !== 'SAVED' && (
                    <button 
                      disabled={loadingId === job.id}
                      onClick={() => handleStatusChange(job.id, 'SAVED')}
                      className="flex justify-center items-center px-4 py-2 bg-white text-gray-700 border border-gray-300 text-sm font-bold rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                    >
                      <Bookmark className="w-4 h-4 mr-2" />
                      Save
                    </button>
                  )}

                  {currentStatus !== 'APPLIED' && (
                    <button 
                      disabled={loadingId === job.id}
                      onClick={() => handleStatusChange(job.id, 'APPLIED')}
                      className="flex justify-center items-center px-4 py-2 bg-white text-green-700 border border-green-300 text-sm font-bold rounded-lg hover:bg-green-50 transition-colors shadow-sm"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Applied
                    </button>
                  )}

                  {currentStatus !== 'IGNORED' && (
                    <button 
                      disabled={loadingId === job.id}
                      onClick={() => handleStatusChange(job.id, 'IGNORED')}
                      className="flex justify-center items-center px-4 py-2 bg-white text-red-700 border border-red-300 text-sm font-bold rounded-lg hover:bg-red-50 transition-colors shadow-sm"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Ignore
                    </button>
                  )}
                </div>
              </div>
            ))}

            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4 mt-8 pt-4 border-t border-gray-100">
                <Link
                  href={`/?status=${currentStatus}&page=${currentPage - 1}`}
                  className={`flex items-center px-4 py-2 border rounded-lg text-sm font-bold transition-colors ${
                    currentPage <= 1 
                      ? 'pointer-events-none opacity-50 bg-gray-50 text-gray-400 border-gray-200' 
                      : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300 shadow-sm'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Link>

                <div className="text-sm font-bold text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>

                <Link
                  href={`/?status=${currentStatus}&page=${currentPage + 1}`}
                  className={`flex items-center px-4 py-2 border rounded-lg text-sm font-bold transition-colors ${
                    currentPage >= totalPages 
                      ? 'pointer-events-none opacity-50 bg-gray-50 text-gray-400 border-gray-200' 
                      : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300 shadow-sm'
                  }`}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            )}
          </>
        )}

        {selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-start p-6 border-b border-gray-200 bg-gray-50">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 leading-tight">{selectedJob.title}</h2>
                  <div className="flex items-center mt-2 text-gray-600 space-x-4">
                    <span className="flex items-center text-sm font-medium">
                      <Building className="w-4 h-4 mr-1.5" />
                      {selectedJob.company}
                    </span>
                    <span className="flex items-center text-sm">
                      <MapPin className="w-4 h-4 mr-1.5" />
                      {selectedJob.location_text}
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelectedJob(null)} className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200 transition-colors">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex-1 p-6 overflow-y-auto bg-white">
                <div 
                  className="prose prose-sm max-w-none text-gray-700 prose-headings:font-bold prose-headings:text-gray-900 prose-a:text-blue-600 hover:prose-a:text-blue-800"
                  dangerouslySetInnerHTML={{ __html: selectedJob.description }} 
                />
              </div>

              <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                <button 
                  onClick={() => setSelectedJob(null)} 
                  className="px-6 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-bold rounded-lg transition-all"
                >
                  Close
                </button>
                <a 
                  href={selectedJob.apply_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all shadow-sm"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Apply on {selectedJob.source}
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
