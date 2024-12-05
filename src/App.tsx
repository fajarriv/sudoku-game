import { SudokuGame } from "./components/sudoku/SudokuGame";


function App() {

  return (
    <div className="mx-auto max-w-4xl text-center space-y-4 ">
      <header className="flex flex-col md:flex-row justify-center">
        <h1 className="text-4xl">Sudoku Puzzle</h1>
      </header>
      <main className="">
        <SudokuGame />
      </main>
    </div>
  );
}

export default App;
