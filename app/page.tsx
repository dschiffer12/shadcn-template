"use client"

import { useState } from 'react';
import Papa from 'papaparse';
import PivotTableUI from 'react-pivottable/PivotTableUI';
import 'react-pivottable/pivottable.css';
import  OpenAI  from 'openai-api';
import { error } from 'console';
import { FormErrorMessage } from '@chakra-ui/react';

const FileUploader = () => {
  const [file, setFile] = useState<File>();
  const [data, setData] = useState<string[][]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      const fileContent = e.target?.result;
      if (fileContent) {
        const { data } = Papa.parse(fileContent.toString());
        setData(data as any[][]);
      }
    };
    reader.onerror = (e) => setError(e.target?.error?.message || 'Unknown error');
    reader.readAsText(file);
    setIsLoading(false);
  };

  const handleAskQuestion = async (question: string) => {
    if (!OpenAI) return;

    setIsLoading(true);
    setError('');

    try {
      const context = data.map((row) => row.join(' ')).join(' ');
      const response = await OpenAI.arguments(handleAskQuestion);
      setOutput(response.data);
    } catch (error) {
      console.error(error);
      setError('An error occurred, please try again.');
    }
    setIsLoading(false);
  };

  return (
    <div>
      <h1>Spreadsheet Interpreter</h1>
      <input type="file" onChange={handleFileChange} />
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <>

          <p>{response}</p>
          <p>{setOutput}</p>
          <p>{data}</p>
          <p>{isLoading}</p>
          <p>Loaded {data.length} rows of data</p>
          <OpenAI arguments={handleAskQuestion}>
            <QuestionForm onSubmit={handleAskQuestion} />
            {output && <PivotTableUI data={output} />}
          </OpenAI>


        </>


      )}
    </div>
  );
};

export default FileUploader;

function setError(_arg0: string) {
  throw new Error('Function not implemented.');
}
function setOutput(data: any) {
  throw new Error('Function not implemented.');
}

