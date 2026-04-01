// EditAuthor renders the edit author page.
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authorApi } from '../api/authApi';
import AuthorForm from '../components/AuthorForm';
import toast from 'react-hot-toast';
const EditAuthor = () => {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchAuthor();
  }, [id]);
  const fetchAuthor = async () => {
    try {
      const data = await authorApi.getAllAuthors({
        limit: 1000
      });
      const found = data.authors.find(a => a.author_id.toString() === id);
      if (found) {
        setAuthor(found);
      } else {
        toast.error('Author not found');
        navigate('/authors');
      }
    } catch (error) {
      console.error('Failed to fetch author:', error);
      toast.error('Failed to load author details');
      navigate('/authors');
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async updates => {
    try {
      await authorApi.updateAuthor(id, updates);
      toast.success('Author updated successfully');
      navigate('/authors');
    } catch (error) {
      console.error('Failed to update author:', error);
      toast.error('Failed to update author');
    }
  };
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>;
  }
  return <div className="min-h-screen bg-gray-50 py-8 px-4">
            <AuthorForm title="Edit Author" author={author} onSubmit={handleSubmit} />
        </div>;
};
export default EditAuthor;
