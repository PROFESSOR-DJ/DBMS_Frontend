import React from 'react';
import { Link } from 'react-router-dom';
import { FaCalendar, FaUser, FaNewspaper } from 'react-icons/fa';

const PaperCard = ({ paper }) => {
  // Handle both _id (MongoDB) and paper_id (MySQL)
  const paperId = paper._id || paper.paper_id;
  
  return (
    <div className="card hover:shadow-md transition-shadow">
      <Link to={`/papers/${paperId}`}>
        <h3 className="text-lg font-semibold text-primary-700 hover:text-primary-800">
          {paper.title}
        </h3>
      </Link>
      
      <div className="mt-3 space-y-2">
        {paper.authors && (
          <div className="flex items-center text-sm text-gray-600">
            <FaUser className="mr-2 flex-shrink-0" />
            <span className="truncate">
              {Array.isArray(paper.authors) ? paper.authors.join(', ') : paper.authors}
            </span>
          </div>
        )}
        
        {paper.journal && (
          <div className="flex items-center text-sm text-gray-600">
            <FaNewspaper className="mr-2 flex-shrink-0" />
            <span className="truncate">{paper.journal}</span>
          </div>
        )}
        
        {paper.year && (
          <div className="flex items-center text-sm text-gray-600">
            <FaCalendar className="mr-2 flex-shrink-0" />
            <span>{paper.year}</span>
            {paper.citation_count && (
              <span className="ml-4">Citations: {paper.citation_count}</span>
            )}
          </div>
        )}
      </div>
      
      {paper.abstract && (
        <p className="mt-3 text-gray-600 text-sm line-clamp-2">
          {paper.abstract}
        </p>
      )}
      
      {paper.doi && (
        <a
          href={`https://doi.org/${paper.doi}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-3 text-primary-600 hover:text-primary-800 text-sm"
        >
          View DOI →
        </a>
      )}
    </div>
  );
};

export default PaperCard;