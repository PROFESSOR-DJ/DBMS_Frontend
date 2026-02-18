import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authorApi } from '../api/authApi';
import AuthorForm from '../components/AuthorForm';
import toast from 'react-hot-toast';

const AddAuthor = () => {
    const navigate = useNavigate();

    const handleSubmit = async (authorData) => {
        try {
            await authorApi.createAuthor(authorData);
            toast.success('Author created successfully');
            navigate('/authors');
        } catch (error) {
            console.error('Failed to create author:', error);
            toast.error('Failed to create author');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <AuthorForm
                title="Add New Author"
                onSubmit={handleSubmit}
            />
        </div>
    );
};

export default AddAuthor;
