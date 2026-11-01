"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="empty-state" role="alert">
      <h1>We couldn’t load this part of your space.</h1>
      <p>
        Please retry. If the problem continues, contact the operator to check
        the database connection.
      </p>
      <button className="button" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
