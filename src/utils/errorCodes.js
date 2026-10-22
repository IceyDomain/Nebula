export const ERROR_CODES = {
  SCHOOLS_PAGE_UNAVAILABLE: {
    code: 'NEB-PAGE-001',
    title: 'For Schools page unavailable',
    message: 'This page is currently unavailable. Please try again later.',
  },
  UI_RENDER_FAILURE: {
    code: 'NEB-UI-001',
    title: 'Page could not be displayed',
    message: 'An unexpected problem prevented this page from loading.',
  },
  GLOBAL_SCRIPT_ERROR: {
    code: 'NEB-JS-001',
    title: 'Unexpected application error',
    message: 'The site encountered an unexpected problem.',
  },
  UNHANDLED_REJECTION: {
    code: 'NEB-ASYNC-001',
    title: 'Background operation failed',
    message: 'An unexpected background operation failed.',
  },
  UNKNOWN_ERROR: {
    code: 'NEB-UNKNOWN-001',
    title: 'Unknown error',
    message: 'An unexpected problem occurred.',
  },
};

export function getErrorInfo(errorType) {
  return ERROR_CODES[errorType] || ERROR_CODES.UNKNOWN_ERROR;
}
