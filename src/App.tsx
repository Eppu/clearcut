import { useState, useEffect, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import './App.css';
import imglyRemoveBackground, { ImageSource, Config } from '@imgly/background-removal';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from '@/components/ui/navigation-menu';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Download } from 'lucide-react';
import React from 'react';

// extend File interface with preview
interface ExtendedFile extends File {
  preview: string;
}

function App() {
  const [files, setFiles] = useState<ExtendedFile[]>([]);
  const [readyImage, setImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const imglyConfig: Config = {
    progress: (key: string, current: number, total: number) => {
      console.log(`Downloading ${key}: ${current} of ${total}`);
    },
  };

  const removeBackground = (acceptedFiles: ImageSource[]) => {
    console.log('acceptedFiles', acceptedFiles);
    console.log('Running imglyRemoveBackground...');
    setIsLoading(true);

    // track how long it takes to remove the background
    const startTime = new Date().getTime();

    // run imglyRemoveBackground. after the background has been removed, return the result
    imglyRemoveBackground(acceptedFiles[0], imglyConfig)
      .then((blob: Blob) => {
        // The result is a blob encoded as PNG. It can be converted to an URL to be used as HTMLImage.src
        console.log('got blob', blob);
        const url = URL.createObjectURL(blob);
        console.log('url is', url);
        setImage(url);
        setIsLoading(false);

        // calculate how long it took to remove the background
        const endTime = new Date().getTime();
        const timeDiff = endTime - startTime; //in ms
        // strip the ms
        const seconds = Math.round(timeDiff / 1000);

        console.log(`Background removal finished in ${seconds} seconds`);
        return url;
      })
      .catch((error: any) => {
        console.log('error', error);
        setIsLoading(false);
      });
  };

  const handleDownload = () => {
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = readyImage;
    link.download = files[0].name.split('.')[0] + '_clearcut.png';
    link.click();
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': [] },
    // onDrop,
    onDrop: (acceptedFiles) => {
      setFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        )
      );
    },
  });

  const thumbs = files.map((file) => (
    <Card key={file.name}>
      <img
        src={file.preview}
        // Revoke data uri after image is loaded
        onLoad={() => {
          URL.revokeObjectURL(file.preview);
        }}
      />
    </Card>
  ));

  useEffect(() => {
    // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
    return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
  }, [files]);

  return (
    <>
      <header className="bg-white">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="hidden w-full text-gray-600 md:flex md:items-center">
              <h1 className="text-gray-700 md:text-center text-2xl font-semibold">ClearCut</h1>
            </div>
            <div className="flex items-center justify-end w-full">An in-browser AI background removal tool.</div>
          </div>
        </div>
      </header>

      <main className="my-8">
        <>
          <div className="container mx-auto">
            <section className="border border-dashed border-gray-500 relative rounded-md">
              {/* <section className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm"> */}
              <div {...getRootProps({ className: 'dropzone text-center p-10 m-auto cursor-pointer' })}>
                <input {...getInputProps()} />
                <p>Drag 'n' drop some files here, or click to select files</p>
              </div>
            </section>

            {/* TODO: Figure out how to change the tab programmatically. */}
            <Tabs defaultValue="original">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="original">Original</TabsTrigger>
                <TabsTrigger value="removed" disabled={!readyImage}>
                  Removed background
                </TabsTrigger>
              </TabsList>
              <TabsContent value="original">{thumbs}</TabsContent>
              <TabsContent value="removed">
                {readyImage && (
                  <Card className="bg-gradient-to-r from-purple-500 to-pink-500">
                    <aside>
                      <img src={readyImage} alt="Image with its background removed by ClearCut" />
                    </aside>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
            {/* {thumbs} */}
            {/* {readyImage && (
              <Card className="bg-gradient-to-r from-purple-500 to-pink-500">
                <aside>
                  <img src={readyImage} alt="Rendered Image" />
                </aside>
              </Card>
            )} */}
          </div>
        </>
        <Button
          variant={'outline'}
          onClick={() => {
            removeBackground(files);
          }}
          disabled={isLoading || !files.length}
        >
          {isLoading && <img className="mr-2 h-4 w-4" src="/images/spinner.gif" alt="Loading" />}
          Remove background
        </Button>
        {readyImage && (
          <Button
            variant={'outline'}
            onClick={() => {
              handleDownload();
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        )}
      </main>
    </>
  );
}

export default App;
