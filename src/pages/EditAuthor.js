import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authorApi } from '../api/authApi';
import AuthorForm from '../components/AuthorForm';
import toast from 'react-hot-toast';

const EditAuthor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [author, setAuthor] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAuthor();
    }, [id]);

    const fetchAuthor = async () => {
        try {
            // Ideally backend should support getAuthorById, but for now we might need to search or get from list
            // Since our backend author implementation is minimal, let's try to get it from the list or assume we have an endpoint
            // NOTE: We verified authorController has getAll, search, but maybe not getById.
            // Let's implement a workaround: fetch all and find, or implement getById if needed.
            // Actually, checking authorRoutes, there is NO getById. 
            // I should probably add getById to backend, but to stay frontend focused as per plan, 
            // I will fetch all and filter for now or rely on state. 
            // BUT fetching all is inefficient. Let me check if I can just pass data via navigation state?
            // Navigation state is lost on refresh. 
            // Let's try to implement getById in backend if easy, OR use search if ID is unique? No.
            // Let's use the 'search' API if it allows search by ID? No.
            // Okay, let's use getAllAuthors with a limit? No.

            // OPTION 1: Update backend to support GET /authors/:id (Best practice)
            // OPTION 2: Fetch list and find (Inefficient but works for now if list is small)

            // Let's go with Option 1 - Update backend authorController later? 
            // User asked to "proceed with implementation plan" which implied frontend changes mainly.
            // But a dedicated edit page needs to fetch data on refresh. 

            // Let's assume for this step I will try to use `getAllAuthors` and filter.
            // If it's too slow, I will fix backend. Use a large limit.
            const data = await authorApi.getAllAuthors({ limit: 1000 });
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

    const handleSubmit = async (updates) => {
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
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <AuthorForm
                title="Edit Author"
                author={author}
                onSubmit={handleSubmit}
            />
        </div>
    );
};

export default EditAuthor;
