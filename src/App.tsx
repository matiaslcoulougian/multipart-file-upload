import React from 'react';
import logo from './demon.png';
import './App.css';
import FileUpload from "./FileUpload";
import axios from "axios";

function App() {
    const [studies, setStudies] = React.useState<any[]>([]);
    const [fileChange, setFileChange] = React.useState<boolean>(false);
    const [selectedStudy, setSelectedStudy] = React.useState<any>(null);

    React.useEffect(() => {
        axios.get('http://localhost:3000/dev/study/fdf95e5f-e8db-4726-8588-0b55754e0ea2?status=created').then((response) => {
            console.log(response.data)
            setStudies(response.data);
        })
    }, [fileChange]);
    console.log(selectedStudy)
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p style={{paddingTop: '10px'}}>
          Upload a file to S3 using multipart upload POC
        </p>
            <div>
                <ul>
                    {studies.length > 0 ? studies.map(study => (
                        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', color: study.sortKey === selectedStudy.sortKey ? "green" : "white"}}>
                            <li key={study.id} style={{paddingRight: "10px"}}>{`${study.id}, ${study.sortKey}, ${study.samplesName}`}</li>
                            <button onClick={() => {setSelectedStudy(study);}}>
                                Select for Upload
                            </button>
                        </div>
                    )) : <div>No studies found. Create one first.</div>}
                </ul>
            </div>
          <FileUpload {...{setFileChange, id: selectedStudy?.id, name: selectedStudy?.name, disabled: !selectedStudy}}/>
      </header>
    </div>
  );
}

export default App;
