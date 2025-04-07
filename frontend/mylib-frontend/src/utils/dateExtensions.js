// Date utility class with proper encapsulation
class DateUtils {
  static #dateCache = new Map();

  static parseDate(dateString) {
    if (!dateString) return null;
    
    // Check cache first
    if (this.#dateCache.has(dateString)) {
      return this.#dateCache.get(dateString);
    }

    // If it's already a Date object, return it
    if (dateString instanceof Date) {
      this.#dateCache.set(dateString, dateString);
      return dateString;
    }

    // Try parsing DD/MM/YYYY HH:mm:ss format first
    if (dateString.includes('/')) {
      const [datePart, timePart] = dateString.split(' ');
      const [day, month, year] = datePart.split('/');
      if (day && month && year) {
        const date = new Date(year, month - 1, day);
        if (timePart) {
          const [hours, minutes, seconds] = timePart.split(':');
          date.setHours(hours || 0, minutes || 0, seconds || 0);
        }
        if (!isNaN(date.getTime())) {
          this.#dateCache.set(dateString, date);
          return date;
        }
      }
    }

    // Try parsing as ISO string (YYYY-MM-DD)
    let date;
    
    // Handle LocalDateTime format (YYYY-MM-DD HH:mm:ss.SSSSSS)
    if (dateString.includes('T') || dateString.includes(' ')) {
      const isoString = dateString.replace(' ', 'T');
      date = new Date(isoString);
    } else {
      date = new Date(dateString);
    }
    
    // If the date is invalid, try parsing different formats
    if (isNaN(date.getTime())) {
      // Try parsing YYYY-MM-DD format without time
      const parts = dateString.split('-');
      if (parts.length === 3) {
        date = new Date(parts[0], parts[1] - 1, parts[2]);
      }
    }

    const result = isNaN(date.getTime()) ? null : date;
    this.#dateCache.set(dateString, result);
    return result;
  }

  static formatToIndianDate(date) {
    if (!date) return '-';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  static formatToIndianDateTime(date) {
    if (!date) return '-';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  static formatToInputDate(date) {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  static isValidDate(dateString) {
    const date = this.parseDate(dateString);
    return date !== null && !isNaN(date.getTime());
  }

  static clearCache() {
    this.#dateCache.clear();
  }
}

// Create standalone functions that use the DateUtils class methods
export const formatDate = (dateString) => {
  try {
    const date = DateUtils.parseDate(dateString);
    return DateUtils.formatToIndianDate(date);
  } catch (error) {
    console.error('Error formatting date:', error, 'Input:', dateString);
    return '-';
  }
};

export const formatDateTime = (dateString) => {
  try {
    const date = DateUtils.parseDate(dateString);
    return DateUtils.formatToIndianDateTime(date);
  } catch (error) {
    console.error('Error formatting date time:', error, 'Input:', dateString);
    return '-';
  }
};

export const formatDateForInput = (dateString) => {
  try {
    const date = DateUtils.parseDate(dateString);
    return DateUtils.formatToInputDate(date);
  } catch (error) {
    console.error('Error formatting date for input:', error, 'Input:', dateString);
    return '';
  }
};

export const isValidDate = (dateString) => DateUtils.isValidDate(dateString);

// Extend Date prototype with Indian format methods
Date.prototype.toIndianDate = function() {
  const day = String(this.getDate()).padStart(2, '0');
  const month = String(this.getMonth() + 1).padStart(2, '0');
  const year = this.getFullYear();
  return `${day}/${month}/${year}`;
};

Date.prototype.toIndianDateTime = function() {
  const day = String(this.getDate()).padStart(2, '0');
  const month = String(this.getMonth() + 1).padStart(2, '0');
  const year = this.getFullYear();
  const hours = String(this.getHours()).padStart(2, '0');
  const minutes = String(this.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
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