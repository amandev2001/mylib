import { memo } from 'react';
import { MagnifyingGlassIcon, PlusIcon, ArrowPathIcon, CheckIcon, XMarkIcon, PencilIcon } from '@heroicons/react/24/outline';
import FormattedDate from './common/FormattedDate';
import { formatDateForInput } from '../utils/dateExtensions';

const LoanTableRow = memo(({ 
  loan, 
  isAdmin, 
  editingLoan, 
  editForm, 
  onEditFormChange, 
  onEditSubmit, 
  onEditCancel, 
  onReturn, 
  onApproveBorrow, 
  onApproveReturn, 
  onCancelBorrowRequest, 
  onCancelReturnRequest, 
  onEditClick,
  isDarkMode 
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'BORROWED':
        return isDarkMode 
          ? 'bg-blue-900 text-blue-200' 
          : 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return isDarkMode 
          ? 'bg-yellow-900 text-yellow-200' 
          : 'bg-yellow-100 text-yellow-800';
      case 'RETURN_PENDING':
        return isDarkMode 
          ? 'bg-orange-900 text-orange-200' 
          : 'bg-orange-100 text-orange-800';
      case 'RETURNED':
        return isDarkMode 
          ? 'bg-green-900 text-green-200' 
          : 'bg-green-100 text-green-800';
      default:
        return isDarkMode 
          ? 'bg-gray-700 text-gray-300' 
          : 'bg-gray-100 text-gray-800';
    }
  };

  const getActionButtons = () => {
    if (editingLoan?.id === loan.id) {
      return (
        <div className="flex space-x-2">
          <button
            className={isDarkMode ? "text-green-400 hover:text-green-300" : "text-green-600 hover:text-green-900"}
            onClick={() => onEditSubmit(loan.id)}
          >
            Save
          </button>
          <button
            className={isDarkMode ? "text-red-400 hover:text-red-300" : "text-red-600 hover:text-red-900"}
            onClick={onEditCancel}
          >
            Cancel
          </button>
        </div>
      );
    }

    const buttons = [];

    if (loan.status === 'BORROWED') {
      buttons.push(
        <button 
          key="return"
          className={`${isDarkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-900"} flex items-center`}
          onClick={() => onReturn(loan.id)}
        >
          <ArrowPathIcon className="h-5 w-5 mr-1" />
          Request Return
        </button>
      );
    }

    if (loan.status === 'PENDING') {
      buttons.push(
        <button 
          key="cancel-borrow"
          className={`${isDarkMode ? "text-red-400 hover:text-red-300" : "text-red-600 hover:text-red-900"} flex items-center`}
          onClick={() => onCancelBorrowRequest(loan.id)}
        >
          <XMarkIcon className="h-5 w-5 mr-1" />
          Cancel Request
        </button>
      );
    }

    if (loan.status === 'RETURN_PENDING') {
      buttons.push(
        <button 
          key="cancel-return"
          className={`${isDarkMode ? "text-red-400 hover:text-red-300" : "text-red-600 hover:text-red-900"} flex items-center`}
          onClick={() => onCancelReturnRequest(loan.id)}
        >
          <XMarkIcon className="h-5 w-5 mr-1" />
          Cancel Return
        </button>
      );
    }

    if (isAdmin) {
      if (loan.status === 'PENDING') {
        buttons.push(
          <button 
            key="approve-borrow"
            className={`${isDarkMode ? "text-green-400 hover:text-green-300" : "text-green-600 hover:text-green-900"} flex items-center`}
            onClick={() => onApproveBorrow(loan.id)}
          >
            <CheckIcon className="h-5 w-5 mr-1" />
            Approve Borrow
          </button>
        );
      } else if (loan.status === 'RETURN_PENDING') {
        buttons.push(
          <button 
            key="approve-return"
            className={`${isDarkMode ? "text-green-400 hover:text-green-300" : "text-green-600 hover:text-green-900"} flex items-center`}
            onClick={() => onApproveReturn(loan.id)}
          >
            <CheckIcon className="h-5 w-5 mr-1" />
            Approve Return
          </button>
        );
      }

      buttons.push(
        <button 
          key="edit"
          className={`${isDarkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-900"} flex items-center`}
          onClick={() => onEditClick(loan)}
        >
          <PencilIcon className="h-5 w-5 mr-1" />
          Edit
        </button>
      );
    }

    return <div className="flex space-x-4">{buttons}</div>;
  };

  return (
    <tr className={isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={`text-sm font-medium ${isDarkMode ? "text-gray-200" : "text-gray-900"}`}>{loan.id}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={`text-sm font-medium ${isDarkMode ? "text-gray-200" : "text-gray-900"}`}>{loan.bookTitle}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-900"}`}>{loan.memberName}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {editingLoan?.id === loan.id ? (
          <input
            type="date"
            className={`text-sm border rounded px-2 py-1 ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : ""}`}
            value={editForm.issueDate}
            onChange={(e) => onEditFormChange({ ...editForm, issueDate: e.target.value })}
          />
        ) : (
          <FormattedDate date={loan.issueDate} darkMode={isDarkMode} />
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {editingLoan?.id === loan.id ? (
          <input
            type="date"
            className={`text-sm border rounded px-2 py-1 ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : ""}`}
            value={editForm.dueDate}
            onChange={(e) => onEditFormChange({ ...editForm, dueDate: e.target.value })}
          />
        ) : (
          <FormattedDate date={loan.dueDate} darkMode={isDarkMode} />
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {editingLoan?.id === loan.id ? (
          <input
            type="date"
            className={`text-sm border rounded px-2 py-1 ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : ""}`}
            value={editForm.returnDate}
            onChange={(e) => onEditFormChange({ ...editForm, returnDate: e.target.value })}
          />
        ) : (
          <FormattedDate date={loan.returnDate} darkMode={isDarkMode} />
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {editingLoan?.id === loan.id ? (
          <input
            type="number"
            step="0.01"
            className={`text-sm border rounded px-2 py-1 ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : ""}`}
            value={editForm.fineAmount}
            onChange={(e) => onEditFormChange({ ...editForm, fineAmount: e.target.value })}
          />
        ) : (
          <div className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>${loan.fineAmount || '0.00'}</div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(loan.status)}`}>
          {loan.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        {getActionButtons()}
      </td>
    </tr>
  );
});

LoanTableRow.displayName = 'LoanTableRow';

export default LoanTableRow; 