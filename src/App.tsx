import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import './App.css';
import imglyRemoveBackground, { ImageSource } from '@imgly/background-removal';
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

// extend File interface with preview
interface ExtendedFile extends File {
  preview: string;
}

function App() {
  const [files, setFiles] = useState<ExtendedFile[]>([]);
  const [readyImage, setImage] = useState<string>('');

  const removeBackground = (acceptedFiles: ImageSource[]) => {
    console.log('acceptedFiles', acceptedFiles);
    console.log('Running imglyRemoveBackground...');
    // run imglyRemoveBackground. after the background has been removed, return the result
    imglyRemoveBackground(acceptedFiles[0])
      .then((blob: Blob) => {
        // The result is a blob encoded as PNG. It can be converted to an URL to be used as HTMLImage.src
        console.log('got blob', blob);
        const url = URL.createObjectURL(blob);
        console.log('url is', url);
        setImage(url);
        return url;
      })
      .catch((error: any) => {
        console.log('error', error);
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
    <div key={file.name}>
      <div>
        <img
          src={file.preview}
          // Revoke data uri after image is loaded
          onLoad={() => {
            URL.revokeObjectURL(file.preview);
          }}
        />
      </div>
    </div>
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
              <div className="text-gray-700 md:text-center text-2xl font-semibold">ClearCut</div>
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
              <div className="text-center p-10  m-auto cursor-pointer">
                <div {...getRootProps({ className: 'dropzone' })}>
                  <input {...getInputProps()} />
                  <p>Drag 'n' drop some files here, or click to select files</p>
                </div>
              </div>
            </section>
            {thumbs}
            {readyImage && (
              <Card>
                <aside>
                  <img src={readyImage} alt="Rendered Image" />
                </aside>
              </Card>
            )}
          </div>
        </>
        <Button
          variant={'outline'}
          onClick={() => {
            removeBackground(files);
          }}
        >
          Remove background
        </Button>
        {readyImage && (
          <Button
            variant={'outline'}
            onClick={() => {
              handleDownload();
            }}
          >
            Download
          </Button>
        )}
      </main>
    </>
  );
}

export default App;
