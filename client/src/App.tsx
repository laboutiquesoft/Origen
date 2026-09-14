import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./core/routes/AppRoutes";
import './core/styles/index.css'

function App() {
  
  return (
    <BrowserRouter>
      <AppRoutes/>
    </BrowserRouter>      
    )
}

export default App;