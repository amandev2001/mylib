// Global date formatting options
const dateOptions = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'Asia/Kolkata'
};

// Global date formatting function
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', dateOptions);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

// Format date for input fields
export const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date for input:', error);
    return dateString;
  }
};

// Format date with time
export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      ...dateOptions,
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date time:', error);
    return dateString;
  }
};

// Create a custom hook for date formatting
import { useMemo } from 'react';

export const useDateFormatter = (dateString, format = 'date') => {
  return useMemo(() => {
    switch (format) {
      case 'datetime':
        return formatDateTime(dateString);
      case 'input':
        return formatDateForInput(dateString);
      default:
        return formatDate(dateString);
    }
  }, [dateString, format]);
}; 