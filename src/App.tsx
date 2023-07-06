import { useState } from 'react';
import './App.css';
import imglyRemoveBackground from '@imgly/background-removal';
import { Button } from '@/components/ui/button';

// let image_src: ImageData | ArrayBuffer | Uint8Array | Blob | URL | string = ...;
let image_src: ImageData | ArrayBuffer | Uint8Array | Blob | URL | string =
  'https://images.unsplash.com/photo-1622836920016-8b7b3b0b0b0b?ixid=MnwxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwzNnx8fGVufDB8fHx8&ixlib=rb-1.2.1&w=1000&q=80';

imglyRemoveBackground(image_src).then((blob: Blob) => {
  // The result is a blob encoded as PNG. It can be converted to an URL to be used as HTMLImage.src
  const url = URL.createObjectURL(blob);
  console.log('url is', url);
  return url;
});

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

function App() {
  // const [count, setCount] = useState(0);

  return (
    <>
      <header className="bg-white">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="hidden w-full text-gray-600 md:flex md:items-center">
              <div className="text-gray-700 md:text-center text-2xl font-semibold">
                ClearCut
              </div>
            </div>
            <div className="flex items-center justify-end w-full">jeejee</div>
          </div>

          {/* <div className="relative mt-6 max-w-lg mx-auto">juhuu</div> */}
        </div>
      </header>

      <main className="my-8">
        asdasdasdasdasd
        <div className="container mx-auto">wasdasdasdasdasd</div>
        <Button variant={'outline'}>Remove background</Button>
      </main>
    </>
  );
}

export default App;
