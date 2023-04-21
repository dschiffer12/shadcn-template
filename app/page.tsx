"use client"

import { useState } from 'react';
import Papa, { ParseMeta, parse } from 'papaparse';
import ReactPivottableUI from 'react-pivottable';
import OpenAI from 'openai-api';
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Spinner,
} from '@chakra-ui/react';
import PivotTableUI from 'react-pivottable/PivotTableUI';
import TableRenderers from 'react-pivottable/TableRenderers';

interface CSVData {
  onChange: (data: CSVData) => void;
  data: CSVRow[];
  meta: {
    fields: string[];
  };
  onChange: (data: CSVData) => void;
  log: (msg: string) => void;
}

interface CSVRow {
  [key: string]: string;
}

function parseCSV<T extends CSVRow>(csv: string): T[] {
  const lines = csv.split('');
  const [header, ...rows] = lines;
  const keys = header.split(',');
  const data: T[] = [];

  for (const row of rows) {
    const values = row.split(',');
    const item: CSVData = {};

    for (let i = 0; i < values.length; i++) {
      item[keys[i]] = values[i];
    }

    data.push(item);
  }

  return data;
}

const csv = 'csvData'
const data = parseCSV(csv);

console.log(data);

const FileUploader = () => {
  const [file, setFile] = useState<File>();
  const [data, setData] = useState<string[][]>([]);
  const [csvData, setCsvData] = useState<CSVData>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<string>();
  const [error, setError] = useState<string>();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError('');

    const reader = new FileReader();
  const onFileRead = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileContent = event.target?.files?.[0];
    if (fileContent) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContent = e.target?.result;
        if (fileContent) {
          const { data, meta }: { data: CSVRow[], meta: ParseMeta } = parse(fileContent.toString(), {
            header: true,
          });
          const csvData: CSVData = {
            data, meta: { fields: [meta.fields] }, onChange: (data: CSVData) => {
              setCsvData(data);
            },
            onchange: function (data: CSVData): void {
              throw new Error('Function not implemented.');
            }
          };
          setCsvData(csvData);
        }
      };
      reader.readAsText(fileContent);
    }
  };
  const handleAskQuestion = async (question: string) => {
    if (!OpenAI) return;

    setIsLoading(true);
    setError('');

    try {
      const context = data.map((row) => row.join(' ')).join(' ');
      const response = await OpenAI.arguments(question, context);
      setResponse(response.data);
    } catch (error) {
      console.error(error);
      setError('An error occurred, please try again.');
    }
    setIsLoading(false);
  };
  const handleFieldChange = (field: string | undefined, value: FormControl) => {
    if (field && csvData) {
      const newCsvData: CSVData = {
        ...csvData,
        [field]: value,
      };
      setCsvData(newCsvData);
    }
  };
  console.log("csvData", csvData);
return (
    <Box p={5}>
      <Heading mb={5}>Pivot Table App</Heading>
      <FormControl mb={5}>
        <FormLabel>Upload CSV file:</FormLabel>
        <Input type="file" onChange={handleFileChange} />
      </FormControl>
      {isLoading && (
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
          size="xl"
          alignSelf="center"
        />
      )}
      {csvData && (
        <PivotTableUI data={csvData.data} onChange={csvData.onChange} rendererName='PivotTableUI' renderers={Object.assign({}, TableRenderers, {
          'Table Barchart': TableRenderers['Table Barchart'],
          'Table Heatmap': TableRenderers['Table Heatmap'],
          'Table Map': TableRenderers['Table Map'],

        })}
        />
      )}
    </Box>
  );
};
}