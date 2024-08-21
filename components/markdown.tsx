import React from 'react';
import markdownit from 'markdown-it';
import DomPurify from 'dompurify';

type Props = {
  text: string;
};

const md = markdownit({});
const Markdown = ({ text }: Props) => {
  const htmlContent = md.render(text);
  const sanitized = DomPurify.sanitize(htmlContent);
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
};

export default Markdown;
