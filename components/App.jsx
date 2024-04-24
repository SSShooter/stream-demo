// Literally just to server render and deliver to the client side.
import React from "react"

const App = () => (
  <main>
    <div className="search">
      <h1>🕵️ ‍📖</h1>
      <div className="search-field">
        <button id="search-button">Find</button>
        <button id="fetch-all">Fetch All</button>
      </div>
    </div>
    <div id="error" className="hidden">
      <h2>Oops</h2>
      <p>Your current browser doesn't support streaming :(</p>
    </div>
    <pre id="results" className="results-container" />
  </main>
)

export default App
