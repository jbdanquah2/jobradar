'use client';

import { useState, useEffect } from 'react';
import { getProfileContent, updateProfileContent } from '@/app/actions';
import { User, X, Save, Eye, FileText } from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

export default function ProfileEditor() {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    if (isOpen) {
      getProfileContent().then(setContent);
    }
  }, [isOpen]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfileContent(content);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to save profile:", error);
      alert("Failed to save profile. See console for details.");
    } finally {
      setIsSaving(false);
    }
  };

  const getPreviewHtml = () => {
    const rawHtml = marked.parse(content) as string;
    // In SSR, DOMPurify needs a window object. We wrap this safely.
    if (typeof window !== 'undefined') {
      return DOMPurify.sanitize(rawHtml);
    }
    return rawHtml;
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-bold rounded-lg transition-all shadow-sm"
      >
        <User className="w-4 h-4 mr-2" />
        Edit Resume
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-xl font-bold flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Edit Resume
              </h2>
              <div className="flex bg-gray-200 p-1 rounded-lg">
                <button 
                  onClick={() => setActiveTab('edit')}
                  className={`flex items-center px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'edit' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <FileText className="w-3.5 h-3.5 mr-1.5" />
                  Editor
                </button>
                <button 
                  onClick={() => setActiveTab('preview')}
                  className={`flex items-center px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'preview' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Eye className="w-3.5 h-3.5 mr-1.5" />
                  Preview
                </button>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-200 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4 bg-blue-50/50 text-blue-800 text-sm border-b border-blue-100 flex-none">
              <p><strong>Heads Up:</strong> JobRadar uses the <code className="bg-blue-100 px-1 rounded font-mono">## Core Technical Skills</code> section to calculate your match scores. 
              Keep this header intact. Saving will automatically recalculate scores for all jobs.</p>
            </div>

            <div className="flex-1 p-4 overflow-hidden bg-gray-50">
              {activeTab === 'edit' ? (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-full p-6 font-mono text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none shadow-inner leading-relaxed"
                  spellCheck={false}
                  placeholder="Loading profile..."
                />
              ) : (
                <div className="w-full h-full p-8 bg-white border border-gray-300 rounded-lg overflow-y-auto shadow-inner">
                  <div 
                    className="prose prose-blue max-w-none text-gray-700 prose-headings:border-b prose-headings:pb-2 prose-headings:mt-8 first:prose-headings:mt-0"
                    dangerouslySetInnerHTML={{ __html: getPreviewHtml() }} 
                  />
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 flex justify-end gap-3 bg-white">
              <button 
                onClick={() => setIsOpen(false)}
                className="px-6 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-bold rounded-lg transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave} 
                disabled={isSaving}
                className="flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white text-sm font-bold rounded-lg transition-all shadow-md active:scale-95"
              >
                <Save className={`w-4 h-4 mr-2 ${isSaving ? 'animate-pulse' : ''}`} />
                {isSaving ? 'Saving & Rescoring...' : 'Save Resume & Rescore'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
