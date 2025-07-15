import logo from './logo.svg';
import './App.css';
import Index from './pages/Index.jsx';
import DataDistributor from './components/SP500data/DataDistributor.jsx';


function App() {
  return (
    <DataDistributor>
    <div className="App">
        <Index></Index>
    </div>
    </DataDistributor>
  );
}

export default App;
