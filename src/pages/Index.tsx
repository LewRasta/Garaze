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
      // Create a temporary container
      const tempContainer = document.createElement('div');
      tempContainer.style.width = '800px';
      tempContainer.style.height = '600px';
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      document.body.appendChild(tempContainer);

      // Generate JPEG image for better PDF compatibility
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 800; // Increased height to accommodate all information
      const ctx = canvas.getContext('2d')!;
      
      // Fill with white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 800, 800);
      
      // Add view title
      ctx.fillStyle = '#000000';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`Widok: ${getViewName(viewType)}`, 400, 50);

      // Get the actual canvas from the DOM
      const viewCanvas = document.querySelector('canvas');
      if (viewCanvas) {
        // Draw the view on the main canvas
        ctx.drawImage(viewCanvas, 100, 100, 600, 400);
      }
      
      // Add basic dimensions info
      ctx.font = '16px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`Wymiary: ${dimensions.length} x ${dimensions.width} x ${dimensions.height} cm`, 50, 550);
      ctx.fillText(`Dach: ${getRoofName(dimensions.roofType)}`, 50, 570);
      if (dimensions.roofType !== 'flat') {
        ctx.fillText(`Wysokość kalenicy: ${Math.round(dimensions.ridgeHeight)} cm`, 50, 590);
      }
      ctx.fillText(`Brama: ${dimensions.gates.length} szt.`, 50, 630);
      
      if (dimensions.windows.length > 0) {
        ctx.fillText(`Okna: ${dimensions.windows.length} szt.`, 50, 650);
      }

      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      document.body.removeChild(tempContainer);
      resolve(dataUrl);
    });
  };

  const getViewName = (viewType: ViewType): string => {
    switch (viewType) {
      case 'immersive': return '3D Immersyjny';
      case 'front': return 'Z przodu';
      case 'back': return 'Z tyłu';
      case 'left': return 'Z lewej';
      case 'right': return 'Z prawej';
      default: return '';
    }
  };

  const getRoofName = (roofType: string): string => {
    switch (roofType) {
      case 'flat': return 'Płaski';
      case 'gable': return 'Dwuspadowy';
      case 'shed': return 'Jednospadowy';
      default: return '';
    }
  };

  const generatePDF = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({
      unit: 'pt',
      format: 'a4',
      orientation: 'portrait',
    });

    // Tytuł
    doc.setFontSize(24);
    doc.text('Projekt Garażu Blaszanego', 40, 40);

    // Tabela wymiarów u góry
    doc.setFontSize(14);
    const startX = 40;
    let startY = 70;
    const lineHeight = 24;
    const labelWidth = 100;
    const valueX = startX + labelWidth + 10;

    const dimensionsData = [
      ['Wymiary', ''],
      ['Długość', `${dimensions.length} cm`],
      ['Szerokość', `${dimensions.width} cm`],
      ['Wysokość', `${dimensions.height} cm`],
      ['Dach', getRoofName(dimensions.roofType)],
      ['Bramy', `${dimensions.gates.length} szt.`],
      ['Drzwi', `${dimensions.doors.length} szt.`],
      ['Okna', `${dimensions.windows.length} szt.`],
      ['Wiata', dimensions.canopy.enabled ? `Tak (${dimensions.canopy.width}x${dimensions.canopy.depth} cm)` : 'Nie'],
    ];

    // Rysowanie tabeli z wyrównaniem i odstępami
    dimensionsData.forEach(([label, value], index) => {
      doc.text(label, startX, startY + index * lineHeight);
      doc.text(value, valueX, startY + index * lineHeight);
    });

    // Rysowanie 5 największych rzutów pod tabelą
    const views: ViewType[] = ['immersive', 'front', 'back', 'left', 'right'];
    const imageSize = 500;
    const startYImages = startY + dimensionsData.length * lineHeight + 40;

    for (let i = 0; i < views.length; i++) {
      try {
        if (i > 0) {
          doc.addPage();
        }
        setActiveView(views[i]);
        await new Promise(resolve => setTimeout(resolve, 200));
        const imageData = await captureViewAsImage(views[i]);

        // Pobierz wymiary obrazka
        const img = new Image();
        img.src = imageData;
        await new Promise((resolve) => {
          img.onload = resolve;
        });

        // Oblicz proporcjonalne wymiary
        let drawWidth = img.width;
        let drawHeight = img.height;
        const maxWidth = doc.internal.pageSize.getWidth() - 80;
        const maxHeight = doc.internal.pageSize.getHeight() - 120;
        const widthRatio = maxWidth / drawWidth;
        const heightRatio = maxHeight / drawHeight;
        const ratio = Math.min(widthRatio, heightRatio);
        drawWidth = drawWidth * ratio;
        drawHeight = drawHeight * ratio;

        // Wyśrodkuj obrazek na stronie
        const offsetX = (doc.internal.pageSize.getWidth() - drawWidth) / 2;
        const offsetY = (doc.internal.pageSize.getHeight() - drawHeight) / 2;

        doc.addImage(imageData, 'JPEG', offsetX, offsetY, drawWidth, drawHeight);
        doc.text(getViewName(views[i]), doc.internal.pageSize.getWidth() / 2, 30, { align: 'center' });
      } catch (error) {
        console.error(`Error capturing view ${views[i]}:`, error);
      }
    }

    // Zapisz PDF
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
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-4">
              <h2 className="text-lg font-semibold mb-4 text-slate-700">Wymiary</h2>
              <DimensionControls 
                dimensions={dimensions} 
                onChange={setDimensions} 
              />
            </Card>

          {/* Usuwamy ViewSelector z panelu bocznego */}
          {/* <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4 text-slate-700">Widoki</h2>
            <ViewSelector 
              activeView={activeView} 
              onChange={setActiveView} 
            />
          </Card> */}

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

          {/* Main Design Area */}
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
