import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaCalendar, 
  FaUser, 
  FaNewspaper, 
  FaQuoteRight,
  FaExternalLinkAlt,
  FaBookmark,
  FaRegBookmark
} from 'react-icons/fa';

const PaperCard = ({ paper }) => {
  const paperId = paper._id || paper.paper_id;
  const [isBookmarked, setIsBookmarked] = React.useState(false);
  
  const toggleBookmark = (e) => {
    e.preventDefault();
    setIsBookmarked(!isBookmarked);
  };

  // Format authors for display
  const formatAuthors = (authors) => {
    if (!authors) return 'Unknown';
    if (Array.isArray(authors)) {
      if (authors.length === 0) return 'Unknown';
      if (authors.length === 1) return authors[0];
      if (authors.length === 2) return authors.join(' and ');
      if (authors.length > 3) {
        return `${authors.slice(0, 3).join(', ')} et al.`;
      }
      return authors.slice(0, -1).join(', ') + ' and ' + authors[authors.length - 1];
    }
    return authors;
  };

  return (
    <div className="p-5">
      {/* Title and Bookmark */}
      <div className="flex justify-between items-start mb-3">
        <Link to={`/papers/${paperId}`} className="flex-1">
          <h3 className="text-lg font-semibold text-primary-700 hover:text-primary-900 leading-tight">
            {paper.title}
          </h3>
        </Link>
        <button
          onClick={toggleBookmark}
          className="ml-3 text-gray-400 hover:text-primary-600 transition-colors"
          aria-label="Bookmark"
        >
          {isBookmarked ? <FaBookmark size={18} /> : <FaRegBookmark size={18} />}
        </button>
      </div>
      
      {/* Authors */}
      {paper.authors && (
        <div className="mb-2">
          <p className="text-sm text-gray-700">
            {formatAuthors(paper.authors)}
          </p>
        </div>
      )}

      {/* Metadata Row */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 mb-3 text-sm text-gray-600">
        {paper.journal && (
          <div className="flex items-center">
            <FaNewspaper className="mr-1.5 flex-shrink-0 text-gray-500" size={14} />
            <span className="truncate">{paper.journal}</span>
          </div>
        )}
        
        {paper.year && (
          <div className="flex items-center">
            <FaCalendar className="mr-1.5 flex-shrink-0 text-gray-500" size={14} />
            <span>{paper.year}</span>
          </div>
        )}

        {paper.citation_count !== undefined && (
          <div className="flex items-center">
            <FaQuoteRight className="mr-1.5 flex-shrink-0 text-gray-500" size={14} />
            <span>{paper.citation_count} citations</span>
          </div>
        )}
      </div>
      
      {/* Abstract Preview */}
      {paper.abstract && (
        <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">
          {paper.abstract}
        </p>
      )}

      {/* Keywords */}
      {paper.keywords && paper.keywords.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {paper.keywords.slice(0, 5).map((keyword, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
            >
              {keyword}
            </span>
          ))}
          {paper.keywords.length > 5 && (
            <span className="px-2 py-1 text-gray-500 text-xs">
              +{paper.keywords.length - 5} more
            </span>
          )}
        </div>
      )}

      {/* Action Links */}
      <div className="flex items-center gap-4 pt-3 border-t border-gray-200">
        <Link
          to={`/papers/${paperId}`}
          className="text-sm text-primary-600 hover:text-primary-800 font-medium"
        >
          View details
        </Link>
        
        {paper.doi && (
          <a
            href={`https://doi.org/${paper.doi}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary-600 hover:text-primary-800 font-medium flex items-center"
          >
            DOI
            <FaExternalLinkAlt size={12} className="ml-1" />
          </a>
        )}

        {paper.has_full_text && (
          <span className="text-sm text-green-600 font-medium">
            Full text available
          </span>
        )}

        {paper.is_covid19 && (
          <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
            COVID-19 Research
          </span>
        )}
      </div>
    </div>
  );
};

export default PaperCard;