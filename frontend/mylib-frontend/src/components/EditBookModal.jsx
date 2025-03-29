import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import BookForm from './BookForm';
import { useDarkMode } from '../context/DarkModeContext';

export default function EditBookModal({ isOpen, onClose, onSubmit, book }) {
  const [submitError, setSubmitError] = useState('');
  const { isDarkMode } = useDarkMode();

  const handleSubmit = async (formData) => {
    try {
      setSubmitError('');
      await onSubmit(book.id, formData);
    } catch (error) {
      console.error('Error updating book:', error);
      setSubmitError(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to update book. Please try again later.'
      );
      throw error; // Re-throw to let BookForm handle the error state
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className={`relative transform overflow-hidden rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6`}>
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className={`rounded-md ${isDarkMode ? 'bg-gray-800 text-gray-400 hover:text-gray-300' : 'bg-white text-gray-400 hover:text-gray-500'}`}
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className={`text-lg font-semibold leading-6 ${isDarkMode ? 'text-white border-gray-700' : 'text-gray-900 border-gray-200'} border-b pb-4`}>
                      Edit Book
                    </Dialog.Title>
                    <BookForm 
                      initialData={book} 
                      onSubmit={handleSubmit} 
                      submitButtonText="Update Book" 
                      isEditMode={true}
                    />
                    
                    {submitError && (
                      <div className={`mt-3 text-sm ${isDarkMode ? 'text-red-400 bg-red-900/50' : 'text-red-600 bg-red-50'} p-3 rounded-md`}>
                        {submitError}
                      </div>
                    )}
                    
                    <div className="mt-4 text-right">
                      <button
                        type="button"
                        className={`mt-3 inline-flex justify-center rounded-md px-3 py-2 text-sm font-semibold ${
                          isDarkMode 
                            ? 'bg-gray-700 text-gray-300 ring-gray-600 hover:bg-gray-600' 
                            : 'bg-white text-gray-900 ring-gray-300 hover:bg-gray-50'
                        } shadow-sm ring-1 ring-inset`}
                        onClick={onClose}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 