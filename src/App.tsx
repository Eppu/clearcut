import { useState, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import './App.css';
import imglyRemoveBackground, { ImageSource, Config } from '@imgly/background-removal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Loader2, SquareSlash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ExtendedFile extends File {
  preview: string;
}

function App() {
  const [files, setFiles] = useState<ExtendedFile[]>([]);
  const [readyImage, setReadyImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStatusMessage, setLoadingStatusMessage] = useState<string>('');

  const removedBackgroundButtonRef = useRef<HTMLButtonElement>(null);
  const originalButtonRef = useRef<HTMLButtonElement>(null);

  // Focus "Removed background tab" when image processing is done
  useEffect(() => {
    if (removedBackgroundButtonRef.current) {
      removedBackgroundButtonRef.current.focus();
    }
  }, [readyImage]);

  // Focus "Original tab" when image is dropped
  useEffect(() => {
    if (originalButtonRef.current) {
      originalButtonRef.current.focus();
    }
  }, [files]);

  const imglyConfig: Config = {
    progress: (key: string, current: number, total: number) => {
      const fetchMessage = 'Downloading model';
      const computeMessage = 'Processing image';
      if (
        key === 'fetch:medium' ||
        key === 'fetch:ort-wasm-simd-threaded.wasm' ||
        key === 'fetch:ort-wasm-simd.wasm' ||
        key === 'fetch:ort-wasm-threaded.wasm' ||
        key === 'fetch:ort-wasm.wasm'
      ) {
        loadingStatusMessage !== fetchMessage && setLoadingStatusMessage(fetchMessage);
        return;
      }

      if (key === 'compute:inference') {
        if (current === total) {
          setLoadingStatusMessage('');
          return;
        }
        setLoadingStatusMessage(computeMessage);
      }
    },
  };

  const removeBackground = (acceptedFiles: ImageSource[]) => {
    console.log('Running background removal job...');
    setIsLoading(true);

    // track how long it takes to remove the background
    // const startTime = new Date().getTime();

    imglyRemoveBackground(acceptedFiles[0], imglyConfig)
      .then((blob: Blob) => {
        // The result is a blob encoded as PNG. It can be converted to an URL to be used as HTMLImage.src
        const url = URL.createObjectURL(blob);
        setReadyImage(url);
        setIsLoading(false);

        // calculate how long it took to remove the background
        // const endTime = new Date().getTime();
        // const timeDiff = endTime - startTime; //in ms
        // // strip the ms
        // const seconds = Math.round(timeDiff / 1000);
        // console.log(`Background removal finished in ${seconds} seconds`);

        return url;
      })
      .catch((error: string) => {
        console.log('error', error);
        setIsLoading(false);
      });
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = readyImage;
    link.download = files[0].name.split('.')[0] + '_clearcut.png';
    link.click();
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': [] },
    multiple: false,
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
    <Card key={file.name} className="justify-center items-center flex flex-col">
      <CardContent>
        <div className="relative">
          <div className={isLoading ? 'absolute inset-0 bg-gray-200 opacity-50' : ''}>
            {isLoading && (
              <div className="flex items-center justify-center h-full w-full">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="ml-2 scroll-m-20 text-2xl font-semibold tracking-tight">{loadingStatusMessage}</p>
              </div>
            )}
          </div>
          <img
            className="max-w-[1000px] max-h-[750px]"
            src={file.preview}
            // Revoke data uri after image is loaded
            onLoad={() => {
              URL.revokeObjectURL(file.preview);
            }}
          />
        </div>
      </CardContent>
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
              <div {...getRootProps({ className: 'dropzone text-center p-10 m-auto cursor-pointer' })}>
                <input {...getInputProps()} />
                {/* TODO: Make thumbs act as dropzone if file is selected. Also add a removal button. */}
                <p>Drag and drop an image file, or click to select a file</p>
              </div>
            </section>

            <Tabs defaultValue="original">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="original" ref={originalButtonRef}>
                  Original
                </TabsTrigger>
                <TabsTrigger value="removed" disabled={!readyImage} ref={removedBackgroundButtonRef}>
                  Removed background
                </TabsTrigger>
              </TabsList>
              <TabsContent value="original">{thumbs}</TabsContent>
              <TabsContent value="removed">
                {readyImage && (
                  <Card className="bg-gradient-to-r from-purple-500 to-pink-500 justify-center items-center flex flex-col ">
                    <CardContent>
                      <img
                        className="max-w-[1000px] max-h-[750px]"
                        src={readyImage}
                        alt="Image with its background removed by ClearCut"
                      />
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </>
        <Button
          onClick={() => {
            removeBackground(files);
          }}
          disabled={isLoading || !files.length}
          className="px-4 py-2 m-4 h4"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {!isLoading && <SquareSlash className="mr-2 h-4 w-4" />}
          Remove background
        </Button>
        {readyImage && (
          <Button
            variant={'outline'}
            onClick={() => {
              handleDownload();
            }}
            className="px-4 py-2 m-4"
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        )}
      </main>

      <footer className="my-8 container mx-auto mt-auto">
        <Card>
          <div className="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
            <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
              Built in 2023 by{' '}
              <a href="https://eetueskelinen.com/" target="_blank" rel="noopener noreferrer">
                <Badge variant="secondary">Eetu Eskelinen</Badge>
              </a>
            </span>
          </div>
        </Card>
      </footer>
    </>
  );
}

export default App;
