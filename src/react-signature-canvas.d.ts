// react-signature-canvas.d.ts
declare module 'react-signature-canvas' {
    import * as React from 'react';
  
    // Minimal prop definitions. 
    // You can expand or refine as needed from the library docs.
    export interface SignatureCanvasProps {
      penColor?: string;
      canvasProps?: React.CanvasHTMLAttributes<HTMLCanvasElement>;
      onBegin?: () => void;
      onEnd?: () => void;
      // etc.
    }
  
    // The class definition:
    export default class SignatureCanvas extends React.Component<SignatureCanvasProps> {
      clear(): void;
      fromDataURL(base64String: string, options?: any): void;
      toDataURL(type?: string, encoderOptions?: number): string;
      on(): void;  // etc. 
      off(): void; // etc.
      getTrimmedCanvas(): HTMLCanvasElement;
      // Add any other methods you might use
    }
  }
  