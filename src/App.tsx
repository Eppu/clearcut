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

let image_src: ImageData | ArrayBuffer | Uint8Array | Blob | URL | string = '';
console.log('image_src', image_src);
// extend File interface with preview
interface ExtendedFile extends File {
  preview: string;
}

function App() {
  const [files, setFiles] = useState<ExtendedFile[]>([]);
  // const [readyImage, setImage] = useState<ImageData | ArrayBuffer | Uint8Array | Blob | URL | string>('');
  const [readyImage, setImage] = useState<URL | string>('');

  const onDrop = useCallback((acceptedFiles: ImageSource[]) => {
    console.log('acceptedFiles', acceptedFiles);
    console.log('Runnig imglyRemoveBackground...');
    // run imglyRemoveBackground. after the background has been removed, return the result
    imglyRemoveBackground(acceptedFiles[0])
      .then((blob: Blob) => {
        // The result is a blob encoded as PNG. It can be converted to an URL to be used as HTMLImage.src
        console.log('got blob', blob);
        const url = URL.createObjectURL(blob);
        console.log('url is', url);
        image_src = url;
        setImage(url);
        return url;
      })
      .catch((error: any) => {
        console.log('error', error);
      });
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': [] },
    onDrop,
  });

  // const thumbs = readyImage.map((readyImage) => (
  //   <div>
  //     <div>
  //       <img src={readyImage} />
  //     </div>
  //   </div>
  // ));

  // useEffect(() => {
  //   // Make sure to revoke the data uris to avoid memory leaks
  //   files.forEach((file) => URL.revokeObjectURL(file.preview));
  // }, [files]);

  return (
    <section className="border border-dashed border-gray-500 relative">
      <div className="text-center p-10  m-auto cursor-pointer">
        <div {...getRootProps({ className: 'dropzone' })}>
          <input {...getInputProps()} />
          <p>Drag 'n' drop some files here, or click to select files</p>
        </div>
      </div>
      {/* <aside>{thumbs}</aside> */}
      {readyImage && (
        <aside>
          <img src={readyImage as string} alt="Rendered Image" />
        </aside>
      )}
    </section>
  );

  // return (
  //   <>
  //     <header className="bg-white">
  //       <div className="container mx-auto px-6 py-3">
  //         <div className="flex items-center justify-between">
  //           <div className="hidden w-full text-gray-600 md:flex md:items-center">
  //             <div className="text-gray-700 md:text-center text-2xl font-semibold">ClearCut</div>
  //           </div>
  //           <div className="flex items-center justify-end w-full">jeejee</div>
  //         </div>
  //       </div>
  //     </header>

  //     <main className="my-8">
  //       asdasdasdasdasd
  //       <div className="container mx-auto">wasdasdasdasdasd</div>
  //       <Button variant={'outline'}>Remove background</Button>
  //     </main>
  //   </>
  // );
}

export default App;
