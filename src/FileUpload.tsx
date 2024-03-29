import React, {useEffect, useState} from 'react';
import axios from 'axios';
import { ProgressBar } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const FILE_CHUNK_SIZE = 5 * 1024 * 1024; // 5 MB
const path = process.env.REACT_APP_BACKEND_URL || 'no url found';
const FileUpload = (props: {setFileChange: any, userId: string, studyId: string, disabled: boolean}) => {
    const [uploading, setUploading] = useState<boolean>(false);

    useEffect(() => {
        setUploadProgress(0);
    }, [props.studyId]);

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

        setUploading(true);

        // Get the total number of parts
        const totalParts = Math.ceil(file.size / FILE_CHUNK_SIZE);

        // Request the backend to initiate the multipart upload and get the UploadId
        const { data: { uploadId, preSignedUrls } } = await axios.post(path + `${props.userId}/${props.studyId}/initiate-samples-upload`, {
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
        await axios.post(path + `${props.userId}/${props.studyId}/complete-samples-upload`, {
            fileName: file.name,
            uploadId,
            parts: uploadedParts,
            size: file.size * 10**-6,
        });
        props.setFileChange(true);
        setUploading(false);
    };

    return (
        <p style={{display: "flex", flexDirection: "column"}}>
            <div style={containerStyle}>
                <input type="file" onChange={handleFileChange} style={inputStyle} />
                <button onClick={handleUpload} style={buttonStyle} disabled={props.disabled || uploading}>Upload</button>
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
