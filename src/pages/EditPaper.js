import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { paperApi } from '../api/authApi';
import PaperForm from '../components/PaperForm';
import toast from 'react-hot-toast';
import { FaArrowLeft } from 'react-icons/fa';

const EditPaper = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [paper, setPaper] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPaper();
    }, [id]);

    const fetchPaper = async () => {
        try {
            const data = await paperApi.getPaperById(id);
            if (data && (data.paper || data)) {
                setPaper(data.paper || data);
            } else {
                toast.error('Paper not found');
                navigate('/papers');
            }
        } catch (error) {
            console.error('Failed to fetch paper:', error);
            toast.error('Failed to load paper details');
            navigate('/papers');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (paperData) => {
        try {
            await paperApi.updatePaper(id, paperData);
            toast.success('Paper updated successfully');
            navigate('/papers');
        } catch (error) {
            console.error('Failed to update paper:', error);
            toast.error('Failed to update paper');
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
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={() => navigate('/papers')}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                    <FaArrowLeft className="mr-2" /> Back to Papers
                </button>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h1 className="text-2xl font-bold text-gray-900">Edit Research Paper</h1>
                        <p className="text-gray-500 mt-1">Update publication details</p>
                    </div>
                    <div className="p-0">
                        <PaperForm
                            paper={paper}
                            onSubmit={handleSubmit}
                            onCancel={() => navigate('/papers')}
                            isPage={true}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditPaper;
