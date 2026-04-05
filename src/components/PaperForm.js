// PaperForm renders the paper form UI component.
import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes } from 'react-icons/fa';
const PaperForm = ({
  paper,
  onSubmit,
  onCancel
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    year: new Date().getFullYear(),
    doi: '',
    journal: '',
    authors: '',
    is_covid19: false,
    has_full_text: false
  });
  useEffect(() => {
    if (paper) {
      setFormData({
        title: paper.title || '',
        abstract: paper.abstract || '',
        year: paper.year || paper.publish_year || new Date().getFullYear(),
        doi: paper.doi || '',
        journal: paper.journal || paper.journal_name || '',
        authors: Array.isArray(paper.authors) ? paper.authors.join(', ') : paper.authors || '',
        is_covid19: paper.is_covid19 || false,
        has_full_text: paper.has_full_text || false
      });
    }
  }, [paper]);
  const handleChange = e => {
    const {
      name,
      value,
      type,
      checked
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  const handleSubmit = async e => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!formData.title.trim()) return alert('Title is required');
    const processedData = {
      ...formData,
      year: parseInt(formData.year, 10),
      authors: formData.authors.split(',').map(a => a.trim()).filter(a => a)
    };
    try {
      setIsSubmitting(true);
      await onSubmit(processedData);
    } finally {
      setIsSubmitting(false);
    }
  };
  const formContent = <form onSubmit={handleSubmit} className="space-y-4">
            {}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500" required />
            </div>

            {}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Abstract</label>
                <textarea name="abstract" value={formData.abstract} onChange={handleChange} rows="4" className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500"></textarea>
            </div>

            {}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Publish Year</label>
                    <input type="number" name="year" value={formData.year} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">DOI</label>
                    <input type="text" name="doi" value={formData.doi} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500" />
                </div>
            </div>

            {}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Journal</label>
                <input type="text" name="journal" value={formData.journal} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500" />
            </div>

            {}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Authors (comma separated)</label>
                <input type="text" name="authors" value={formData.authors} onChange={handleChange} placeholder="e.g. John Doe, Jane Smith" className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary-500 focus:border-primary-500" />
            </div>

            {}
            <div className="flex space-x-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" name="is_covid19" checked={formData.is_covid19} onChange={handleChange} className="rounded text-primary-600 focus:ring-primary-500" />
                    <span className="text-sm text-gray-700">Is COVID-19 Related</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" name="has_full_text" checked={formData.has_full_text} onChange={handleChange} className="rounded text-primary-600 focus:ring-primary-500" />
                    <span className="text-sm text-gray-700">Has Full Text</span>
                </label>
            </div>

            {}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
                <button type="button" onClick={onCancel} disabled={isSubmitting} className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                    Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center shadow-sm disabled:opacity-60 disabled:cursor-not-allowed">
                    <FaSave className="mr-2" />
                    {isSubmitting ? 'Saving...' : paper ? 'Update Paper' : 'Create Paper'}
                </button>
            </div>
        </form>;
  if (paper && !onCancel) {}
  return <div className={paper && !onCancel ? "" : "bg-white p-6 rounded-lg shadow-lg border border-gray-200"}>
            {}
            {}
            {}

            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">{paper ? 'Edit Paper' : 'Add New Paper'}</h2>
                <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
                    <FaTimes />
                </button>
            </div>
            {formContent}
        </div>;
};
export default PaperForm;
