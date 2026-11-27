import { Fragment } from "react";

export default function DocumentContact({ parts }: { parts: string[] }) {
  if (!parts.length) return null;
  return (
    <div className="document-contact">
      {parts.map((part, index) => <Fragment key={index}>
        {index > 0 && <span aria-hidden="true"> | </span>}
        <bdi>{part}</bdi>
      </Fragment>)}
    </div>
  );
}
