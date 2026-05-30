import CanvasStage from "./components/CanvasStage";
import RightPanel from "./components/RightPanel";
import Toolbar from "./components/Toolbar";

function App() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="grid h-screen grid-cols-[176px_minmax(0,1fr)_320px] overflow-hidden">
        <Toolbar />
        <CanvasStage />
        <RightPanel />
      </div>
    </main>
  );
}

export default App;
