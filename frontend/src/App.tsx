import AppRoutes from "./router";
import GamificationSocket from "./services/GamificationSocket";

function App() {
  return (
    <>
      <GamificationSocket />
      <AppRoutes />
    </>
  );
}

export default App;
