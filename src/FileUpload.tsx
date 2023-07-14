import React, {useEffect, useState} from 'react';
import axios from 'axios';
import { ProgressBar } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const FILE_CHUNK_SIZE = 5 * 1024 * 1024; // 5 MB
const path = 'http://localhost:3000/dev/study/';
const FileUpload = (props: {setFileChange: any, id: string, name: string, disabled: boolean}) => {
    useEffect(() => {
        setUploadProgress(0);
    }, [props.id]);

    const containerStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '10px',
    };

    const inputStyle: React.CSSProperties = {
        marginRight: '10px',
        padding: '8px 12px',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    };

    const buttonStyle: React.CSSProperties = {
        padding: '5px 10px',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    };

    const [file, setFile] = useState<File|null>(null);

    const [uploadProgress, setUploadProgress] = useState(0);

    //@ts-ignore
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            return;
        }
        // Get the total number of parts
        const totalParts = Math.ceil(file.size / FILE_CHUNK_SIZE);

        // Request the backend to initiate the multipart upload and get the UploadId
        const { data: { uploadId, preSignedUrls } } = await axios.post(path + `${props.id}/${props.name}/initiate-samples-upload`, {
            fileName: file.name,
            totalParts,
        });

        let uploadedPartsCount = 0; // Track the number of uploaded parts

        const uploadPartPromises = preSignedUrls.map(async (url: string, i: number) => {
            const start = i * FILE_CHUNK_SIZE;
            const end = (i + 1) * FILE_CHUNK_SIZE;
            const chunk = file.slice(start, end);

            const { headers: { etag } } = await axios.put(url, chunk, {
                headers: { 'Content-Type': file.type },
            });

            uploadedPartsCount++;

            const overallProgress = Math.round((uploadedPartsCount / totalParts) * 100);
            setUploadProgress(overallProgress);

            return { PartNumber: i + 1, ETag: etag };
        });

        const uploadedParts = await Promise.all(uploadPartPromises);



        // Complete the multipart upload
        await axios.post(path + `${props.id}/${props.name}/complete-samples-upload`, {
            fileName: file.name,
            uploadId,
            parts: uploadedParts,
            size: file.size * 10**-6,
        });
        props.setFileChange(true);
    };

    return (
        <p style={{display: "flex", flexDirection: "column"}}>
            <div style={containerStyle}>
                <input type="file" onChange={handleFileChange} style={inputStyle} />
                <button onClick={handleUpload} style={buttonStyle} disabled={props.disabled}>Upload</button>
            </div>
            <div>
                <ProgressBar
                    now={uploadProgress}
                    label={`${uploadProgress}%`}
                    variant="success"
                    style={{ backgroundColor: 'white' }}
                />
            </div>
        </p>
    );

};

export default FileUpload;
