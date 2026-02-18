import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaUser, FaSearch, FaCheck, FaFileAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { paperApi } from '../api/authApi';

const AuthorForm = ({ author, onSubmit, title }) => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    // Paper linking states (only for creation)
    const [paperSearch, setPaperSearch] = useState('');
    const [paperResults, setPaperResults] = useState([]);
    const [selectedPaper, setSelectedPaper] = useState(null);
    const [searching, setSearching] = useState(false);
    const isEditMode = !!author;

    useEffect(() => {
        if (author) {
            setName(author.name || author.author || '');
        }
    }, [author]);

    // Search papers effect
    useEffect(() => {
        const delayDebounce = setTimeout(async () => {
            if (paperSearch.trim().length < 2) {
                setPaperResults([]);
                return;
            }

            setSearching(true);
            try {
                // Search for papers to link
                const data = await paperApi.searchPapers(paperSearch);
                setPaperResults(data.papers || []);
            } catch (error) {
                console.error('Paper search failed:', error);
            } finally {
                setSearching(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [paperSearch]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        // Validation: Require paper for new authors
        if (!isEditMode && !selectedPaper) {
            alert('Please link a paper to this author.');
            return;
        }

        setLoading(true);
        try {
            await onSubmit({
                name,
                paper_id: selectedPaper ? (selectedPaper.paper_id || selectedPaper._id) : undefined
            });
        } catch (error) {
            console.error('Error submitting author form:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md mt-10">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <FaUser className="text-primary-600" />
                    {title}
                </h2>
                <button
                    onClick={() => navigate('/authors')}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <FaTimes size={20} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Author Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Dr. Jane Smith"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        required
                    />
                    <p className="mt-2 text-sm text-gray-500">
                        Enter the full name of the author as it should appear in publications.
                    </p>
                </div>

                {/* Paper Linking Section - Only for Creation */}
                {!isEditMode && (
                    <div className="border-t pt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Link to Paper <span className="text-red-500">*</span>
                        </label>
                        <p className="text-sm text-gray-500 mb-3">
                            To ensure database consistency, every new author must be linked to at least one paper.
                        </p>

                        {selectedPaper ? (
                            <div className="flex items-center justify-between bg-green-50 border border-green-200 p-3 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-100 p-2 rounded-full text-green-600">
                                        <FaCheck size={12} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 line-clamp-1">{selectedPaper.title}</p>
                                        <p className="text-xs text-gray-500">{selectedPaper.year} • {selectedPaper.journal || 'No Journal'}</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedPaper(null)}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <FaTimes />
                                </button>
                            </div>
                        ) : (
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaSearch className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={paperSearch}
                                    onChange={(e) => setPaperSearch(e.target.value)}
                                    placeholder="Search for a paper title..."
                                    className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                                {searching && (
                                    <div className="absolute right-3 top-3.5">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                                    </div>
                                )}

                                {/* Search Results Dropdown */}
                                {paperResults.length > 0 && !selectedPaper && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                        {paperResults.map(paper => (
                                            <button
                                                key={paper.paper_id || paper._id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedPaper(paper);
                                                    setPaperSearch('');
                                                    setPaperResults([]);
                                                }}
                                                className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 flex items-start gap-3 transition-colors"
                                            >
                                                <FaFileAlt className="mt-1 text-gray-400" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 line-clamp-1">{paper.title}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {paper.year} • {paper.journal || 'No Journal'}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                    <button
                        type="button"
                        onClick={() => navigate('/authors')}
                        className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || (!isEditMode && !selectedPaper)}
                        className={`px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center gap-2 ${loading || (!isEditMode && !selectedPaper) ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        <FaSave />
                        {loading ? 'Saving...' : 'Save Author'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AuthorForm;
