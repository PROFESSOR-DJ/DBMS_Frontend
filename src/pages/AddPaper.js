import React from 'react';
import { useNavigate } from 'react-router-dom';
import { paperApi } from '../api/authApi';
import PaperForm from '../components/PaperForm';
import toast from 'react-hot-toast';
import { FaArrowLeft } from 'react-icons/fa';

const AddPaper = () => {
    const navigate = useNavigate();

    const handleSubmit = async (paperData) => {
        try {
            const dataToSubmit = {
                ...paperData,
                paper_id: paperData.paper_id || `P${Date.now()}` // Fallback ID if backend needs it
            };
            await paperApi.createPaper(dataToSubmit);
            toast.success('Paper created successfully');
            navigate('/papers');
        } catch (error) {
            console.error('Failed to create paper:', error);
            toast.error('Failed to create paper');
        }
    };

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
                        <h1 className="text-2xl font-bold text-gray-900">Add New Research Paper</h1>
                        <p className="text-gray-500 mt-1">Enter the details of the new publication</p>
                    </div>
                    <div className="p-0">
                        <PaperForm
                            onSubmit={handleSubmit}
                            onCancel={() => navigate('/papers')}
                            isPage={true} // Prop to style form differently if needed
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddPaper;
