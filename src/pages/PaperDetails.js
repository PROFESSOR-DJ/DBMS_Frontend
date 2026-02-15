import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { paperApi } from '../api/authApi';
import {
  FaCalendar,
  FaUser,
  FaNewspaper,
  FaLink,
  FaArrowLeft,
  FaQuoteRight,
  FaTag
} from 'react-icons/fa';

const PaperDetails = () => {
  const { id } = useParams();
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedPapers, setRelatedPapers] = useState([]);

  useEffect(() => {
    fetchPaperDetails();
  }, [id]);

  const fetchPaperDetails = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockPaper = {
        _id: id,
        title: "Advanced Database Management Systems for Research Data",
        abstract: "This paper presents a comprehensive study of modern database management systems optimized for handling large-scale research data. We discuss various architectures, indexing strategies, and query optimization techniques that significantly improve performance in academic research environments.",
        authors: ["Dr. John Smith", "Prof. Jane Doe", "Dr. Robert Johnson", "Prof. Maria Garcia"],
        journal: "Nature Database Systems",
        year: 2023,
        volume: "45",
        issue: "3",
        pages: "234-256",
        doi: "10.1000/xyz123",
        citation_count: 89,
        keywords: ["Database", "Research", "Management", "Optimization", "Indexing"],
        source: "Nature Publishing Group",
        created_at: "2023-05-15T10:30:00Z",
        references: [
          "Smith, J. et al. Database Systems 2021",
          "Johnson, R. Data Management 2022",
          "Brown, M. Query Optimization 2020"
        ]
      };

      const mockRelated = Array.from({ length: 3 }, (_, i) => ({
        _id: `related-${i}`,
        title: `Related Paper ${i + 1} on Database Systems`,
        authors: ['Author A', 'Author B'],
        journal: 'Journal of Databases',
        year: 2022 + i,
        citation_count: Math.floor(Math.random() * 50),
      }));

      setPaper(mockPaper);
      setRelatedPapers(mockRelated);

      setRelatedPapers(mockRelated);

      // Uncomment for real API:
      const data = await paperApi.getPaperById(id);
      if (data) {
        setPaper(data);
        // If you have backend for related papers, fetch here
      }
      // Fetch related papers...
    } catch (error) {
      console.error('Failed to fetch paper details:', error);
      // Fallback or error handling
    } finally {
      setLoading(false);
    }
  };

  // Helper to ensure authors is an array
  const getAuthorsArray = (authors) => {
    if (!authors) return [];
    if (Array.isArray(authors)) return authors;
    if (typeof authors === 'string') return authors.split(', ');
    return [];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading paper details...</p>
        </div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Paper Not Found</h1>
          <Link to="/papers" className="btn-primary inline-flex items-center">
            <FaArrowLeft className="mr-2" />
            Back to Papers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link
            to="/papers"
            className="inline-flex items-center text-primary-600 hover:text-primary-800"
          >
            <FaArrowLeft className="mr-2" />
            Back to Papers
          </Link>
        </div>

        {/* Paper Header */}
        <div className="card mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{paper.title}</h1>

          <div className="flex flex-wrap gap-6 mb-6">
            <div className="flex items-center text-gray-600">
              <FaCalendar className="mr-2" />
              <span>Year: {paper.year}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <FaQuoteRight className="mr-2" />
              <span>Citations: {paper.citation_count}</span>
            </div>
            {paper.doi && (
              <div className="flex items-center text-gray-600">
                <FaLink className="mr-2" />
                <a
                  href={`https://doi.org/${paper.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-800"
                >
                  DOI: {paper.doi}
                </a>
              </div>
            )}
          </div>

          {/* Authors */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <FaUser className="mr-2" />
              Authors
            </h3>
            <div className="flex flex-wrap gap-2">
              {getAuthorsArray(paper.authors).map((author, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {author}
                </span>
              ))}
            </div>
          </div>

          {/* Journal Info */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <FaNewspaper className="mr-2" />
              Publication Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Journal</p>
                <p className="font-medium">{paper.journal}</p>
              </div>
              {paper.volume && (
                <div>
                  <p className="text-sm text-gray-500">Volume</p>
                  <p className="font-medium">{paper.volume}</p>
                </div>
              )}
              {paper.issue && (
                <div>
                  <p className="text-sm text-gray-500">Issue</p>
                  <p className="font-medium">{paper.issue}</p>
                </div>
              )}
              {paper.pages && (
                <div>
                  <p className="text-sm text-gray-500">Pages</p>
                  <p className="font-medium">{paper.pages}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Source</p>
                <p className="font-medium">{paper.source}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Added to DB</p>
                <p className="font-medium">
                  {new Date(paper.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Abstract and Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Abstract */}
            <div className="card">
              <h3 className="text-xl font-semibold mb-4">Abstract</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {paper.abstract}
              </p>
            </div>

            {/* Keywords */}
            {paper.keywords && paper.keywords.length > 0 && (
              <div className="card">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <FaTag className="mr-2" />
                  Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {paper.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Related Papers */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Related Papers</h3>
              <div className="space-y-4">
                {relatedPapers.map((related) => (
                  <Link
                    key={related._id}
                    to={`/papers/${related._id}`}
                    className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <h4 className="font-medium text-gray-900 hover:text-primary-700 line-clamp-2">
                      {related.title}
                    </h4>
                    <div className="mt-2 text-sm text-gray-600">
                      <span>{related.journal}, {related.year}</span>
                      {related.citation_count > 0 && (
                        <span className="ml-2">({related.citation_count} citations)</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Database Info */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Database Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Document ID</p>
                  <p className="font-mono text-sm">{paper._id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Indexed Fields</p>
                  <p className="text-sm">Title, Abstract, Authors, Journal, Keywords</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Query Performance</p>
                  <p className="text-sm">Indexed lookup: ~2ms</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaperDetails;