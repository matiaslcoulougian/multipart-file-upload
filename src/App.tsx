import React from 'react';
import logo from './demon.png';
import './App.css';
import FileUpload from "./FileUpload";
import axios from "axios";

const url = process.env.REACT_APP_BACKEND_URL || 'no url found';

const iconButtonStyle: React.CSSProperties = {
    color: "transparent",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    outline: "none",
    paddingBottom: "35px",
    margin: "0",
    borderRadius: 200
}

function App() {
    const [studies, setStudies] = React.useState<any[]>([]);
    const [fileChange, setFileChange] = React.useState<boolean>(false);
    const [selectedStudy, setSelectedStudy] = React.useState<any>(null);
    const [reloadStudies, setReloadStudies] = React.useState<boolean>(false);

    React.useEffect(() => {
        axios.get(url + '0681ebe4-54f7-4f8b-a5c1-f659022a8f76').then((response) => {
            setStudies(response.data);
        }).catch((error) => {
            console.log(error);
        });
    }, [fileChange, reloadStudies]);

  return (
    <div className="App">
      <header className="App-header">
          <button onClick={()=> {setReloadStudies(!reloadStudies)}} style={iconButtonStyle}>
              <img src={logo} className="App-logo" alt="logo"/>
          </button>
        <p style={{paddingTop: '10px'}}>
          Upload a file to S3 using multipart upload POC. Click on the demon to refresh the list of studies.
        </p>
            <div>
                <ul>
                    {studies.length > 0 ? studies.map(study => (
                        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', color: study.sortKey === selectedStudy?.sortKey ? "green" : "white"}}>
                            <li key={study.id} style={{paddingRight: "10px"}}>{`${study.sortKey} - ${study.name} - ${study.samplesName}`}</li>
                            <button onClick={() => {setSelectedStudy(study);}}>
                                Select for Upload
                            </button>
                        </div>
                    )) : <div>No studies found. Create one first.</div>}
                </ul>
            </div>
          <FileUpload {...{setFileChange, userId: selectedStudy?.userId, studyId: selectedStudy?.sortKey?.split('#')[1], disabled: !selectedStudy}}/>
      </header>
    </div>
  );
}

export default App;
