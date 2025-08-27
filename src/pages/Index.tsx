import { useState } from 'react';
import React from 'react';
import { GarageDesigner } from '@/components/GarageDesigner';
import { DimensionControls } from '@/components/DimensionControls';
import { ViewSelector } from '@/components/ViewSelector';
import { ImmersiveView } from '@/components/views/ImmersiveView';
import { OrthographicView } from '@/components/views/OrthographicView';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export interface GarageDimensions {
  length: number;
  width: number;
  height: number;
  roofType: 'flat' | 'gable' | 'shed';
  ridgeHeight: number;
  gates: {
    width: number;
    height: number;
    position: 'front' | 'back' | 'left' | 'right';
    offsetX: number;
    offsetY: number;
    type?: 'standard' | 'tilt';
  }[];
  doors: {
    width: number;
    height: number;
    position: 'front' | 'back' | 'left' | 'right';
    offsetX: number;
    offsetY: number;
    side?: 'left' | 'right';
  }[];
  windows: {
    width: number;
    height: number;
    position: 'front' | 'back' | 'left' | 'right';
    offsetX: number;
    offsetY: number;
  }[];
  canopy: {
    enabled: boolean;
    width: number;
    depth: number;
    position: 'front' | 'back' | 'left' | 'right';
    offsetX: number;
    offsetY: number;
  };
}

export type ViewType = 'immersive' | 'front' | 'back' | 'left' | 'right';

const Index = () => {
  const [dimensions, setDimensions] = useState<GarageDimensions>({
    length: 600,
    width: 300,
    height: 250,
    roofType: 'gable',
    ridgeHeight: 350,
    gates: [],
    doors: [],
    windows: [],
    canopy: {
      enabled: false,
      width: 0,
      depth: 0,
      position: 'front',
      offsetX: 0,
      offsetY: 0
    }
  });

  const [activeView, setActiveView] = useState<ViewType>('immersive');

  const captureViewAsImage = async (viewType: ViewType): Promise<string> => {
    return new Promise((resolve) => {
      const tempContainer = document.createElement('div');
      tempContainer.style.width = '800px';
      tempContainer.style.height = '600px';
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      document.body.appendChild(tempContainer);

      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 800; 
      const ctx = canvas.getContext('2d')!;
      
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 800, 800);
      
      const viewCanvas = document.querySelector('canvas');
      if (viewCanvas) {
        ctx.drawImage(viewCanvas, 0, 0, 800, 800); // Rysowanie bez dodatkowych podpisów
      }
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      document.body.removeChild(tempContainer);
      resolve(dataUrl);
    });
  };

  const generatePDF = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({
      unit: 'pt',
      format: 'a4',
      orientation: 'portrait',
    });

    // Dodanie strony z podsumowaniem
    doc.setFontSize(24);
    doc.text('Podsumowanie Wymiarów Garażu', 40, 40);
    doc.setFontSize(14);
    
    let yPosition = 70;
    doc.text(`Długość: ${dimensions.length} cm`, 40, yPosition);
    yPosition += 20;
    doc.text(`Szerokość: ${dimensions.width} cm`, 40, yPosition);
    yPosition += 20;
    doc.text(`Wysokość: ${dimensions.height} cm`, 40, yPosition);
    yPosition += 20;
    doc.text(`Typ dachu: ${dimensions.roofType}`, 40, yPosition);
    yPosition += 20;
    doc.text(`Wysokość kalenicy: ${dimensions.ridgeHeight} cm`, 40, yPosition);
    yPosition += 30;

    // Bramy
    if (dimensions.gates.length > 0) {
        doc.text('Bramy:', 40, yPosition);
        yPosition += 20;
        dimensions.gates.forEach((gate, index) => {
            doc.text(`  Brama ${index + 1}: ${gate.width}x${gate.height} cm, pozycja: ${gate.position}`, 40, yPosition);
            yPosition += 20;
        });
    } else {
        doc.text('Bramy: brak', 40, yPosition);
        yPosition += 20;
    }
    yPosition += 10;

    // Drzwi
    if (dimensions.doors.length > 0) {
        doc.text('Drzwi:', 40, yPosition);
        yPosition += 20;
        dimensions.doors.forEach((door, index) => {
            doc.text(`  Drzwi ${index + 1}: ${door.width}x${door.height} cm, pozycja: ${door.position}`, 40, yPosition);
            yPosition += 20;
        });
    } else {
        doc.text('Drzwi: brak', 40, yPosition);
        yPosition += 20;
    }
    yPosition += 10;

    // Okna
    if (dimensions.windows.length > 0) {
        doc.text('Okna:', 40, yPosition);
        yPosition += 20;
        dimensions.windows.forEach((window, index) => {
            doc.text(`  Okno ${index + 1}: ${window.width}x${window.height} cm, pozycja: ${window.position}`, 40, yPosition);
            yPosition += 20;
        });
    } else {
        doc.text('Okna: brak', 40, yPosition);
        yPosition += 20;
    }
    yPosition += 10;

    // Zadaszenie
    if (dimensions.canopy.enabled) {
        doc.text(`Zadaszenie: ${dimensions.canopy.width}x${dimensions.canopy.depth} cm, pozycja: ${dimensions.canopy.position}`, 40, yPosition);
    } else {
        doc.text('Zadaszenie: brak', 40, yPosition);
    }

    doc.addPage(); // Dodanie nowej strony przed widokami

    const views: ViewType[] = ['immersive', 'front', 'back', 'left', 'right'];

    for (let i = 0; i < views.length; i++) {
      try {
        if (i > 0) {
          doc.addPage();
        }
        setActiveView(views[i]);
        await new Promise(resolve => setTimeout(resolve, 200));
        const imageData = await captureViewAsImage(views[i]);

        const img = new Image();
        img.src = imageData;
        await new Promise((resolve) => {
          img.onload = resolve;
        });

        let drawWidth = img.width;
        let drawHeight = img.height;
        const maxWidth = doc.internal.pageSize.getWidth() - 80;
        const maxHeight = doc.internal.pageSize.getHeight() - 120;
        const widthRatio = maxWidth / drawWidth;
        const heightRatio = maxHeight / drawHeight;
        const ratio = Math.min(widthRatio, heightRatio);
        drawWidth = drawWidth * ratio;
        drawHeight = drawHeight * ratio;

        const offsetX = (doc.internal.pageSize.getWidth() - drawWidth) / 2;
        const offsetY = (doc.internal.pageSize.getHeight() - drawHeight) / 2;

        doc.addImage(imageData, 'JPEG', offsetX, offsetY, drawWidth, drawHeight);
      } catch (error) {
        console.error(`Error capturing view ${views[i]}:`, error);
      }
    }

    doc.save('projekt-garazu.pdf');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Projektant Garażu Blaszanego
          </h1>
          <p className="text-slate-600">
            Zaprojektuj swój garaż z dokładnymi wymiarami i różnymi widokami
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-4">
              <h2 className="text-lg font-semibold mb-4 text-slate-700">Wymiary</h2>
              <DimensionControls 
                dimensions={dimensions} 
                onChange={setDimensions} 
              />
            </Card>

            <Card className="p-4">
              <Button 
                onClick={generatePDF}
                className="w-full gap-2"
              >
                <Download className="w-4 h-4" />
                Generuj PDF
              </Button>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <div className="mb-4">
              <ViewSelector 
                activeView={activeView} 
                onChange={setActiveView} 
              />
            </div>
            <Card className="p-6 h-[700px]">
              <GarageDesigner 
                dimensions={dimensions} 
                viewType={activeView} 
              />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
