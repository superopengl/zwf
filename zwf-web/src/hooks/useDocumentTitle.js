import React from 'react';

export const useDocumentTitle = (initTitle) => {
  const [title, setTitle] = React.useState(initTitle);

  React.useEffect(() => {
    const preTitle = document.title;
    return () => {
      document.title = preTitle;
    }
  }, []);

  React.useEffect(() => {
    document.title = title ? `ZeeWorkflow | ${title}` : 'ZeeWorkflow';
  }, [title]);

  return [title, setTitle];
}