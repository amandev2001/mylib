import { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import { formatDate } from '../../utils/dateExtensions';

const FormattedDate = memo(({ 
  date, 
  className = '', 
  fallback = '-',
  darkMode = false
}) => {
  const formattedDate = useMemo(() => {
    try {
      return formatDate(date) || fallback;
    } catch (error) {
      console.error('Error formatting date:', error);
      return fallback;
    }
  }, [date, fallback]);

  return (
    <div 
      className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} ${className}`}
      title={formattedDate}
    >
      {formattedDate}
    </div>
  );
});

FormattedDate.propTypes = {
  date: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Date),
    PropTypes.number
  ]),
  className: PropTypes.string,
  fallback: PropTypes.string,
  darkMode: PropTypes.bool
};

FormattedDate.displayName = 'FormattedDate';

export default FormattedDate; 