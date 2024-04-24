import React from "react"

import Book from "../Book/Book"

const Results = ({ results }) => (
  <div className="results">
    {(results||[]).map(result => (
      <Book
        key={result.quote}
        title={result.anime}
        author={result.character}
        description={result.quote}
      />
    ))}
  </div>
)

export default Results
