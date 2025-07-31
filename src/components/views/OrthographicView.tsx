import { useEffect, useRef } from 'react';
import { GarageDimensions, ViewType } from '@/pages/Index';

interface OrthographicViewProps {
  dimensions: GarageDimensions;
  viewType: ViewType;
}

export const OrthographicView = ({ dimensions, viewType }: OrthographicViewProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

    // Draw orthographic view
    drawOrthographicView(ctx, dimensions, viewType, canvas.offsetWidth, canvas.offsetHeight);
  }, [dimensions, viewType]);

  const drawOrthographicView = (
    ctx: CanvasRenderingContext2D,
    dims: GarageDimensions,
    view: ViewType,
    canvasWidth: number,
    canvasHeight: number
  ) => {
    const padding = 50;
    const { length, width, height, roofType, ridgeHeight } = dims;

    // Calculate total height including ridge for scaling
    let totalHeightForScaling = height;
    if (roofType !== 'flat') {
      totalHeightForScaling = Math.max(height, ridgeHeight);
    }

    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#f8fafc';

    let viewWidth, viewHeight;

    switch (view) {
      case 'front':
        viewWidth = length;
        viewHeight = totalHeightForScaling;
        break;
      case 'back':
        viewWidth = length;
        viewHeight = totalHeightForScaling;
        break;
      case 'left':
        viewWidth = width;
        viewHeight = totalHeightForScaling;
        break;
      case 'right':
        viewWidth = width;
        viewHeight = totalHeightForScaling;
        break;
      default:
        return;
    }

    // Calculate scale
    const scale = Math.min(
      (canvasWidth - 2 * padding) / viewWidth,
      (canvasHeight - 2 * padding - 200) / viewHeight
    );

    const scaledWidth = viewWidth * scale;
    const scaledHeightOverall = viewHeight * scale;
    const scaledWallHeight = dims.height * scale;
    const offsetX = (canvasWidth - scaledWidth) / 2;
    const garageBottomY = canvasHeight - padding;

    // Draw main structure (walls)
    ctx.beginPath();
    ctx.rect(offsetX, garageBottomY - scaledWallHeight, scaledWidth, scaledWallHeight);
    ctx.fill();
    ctx.stroke();

    // Draw roof outline
    if (roofType !== 'flat') {
      const wallTopY = garageBottomY - scaledWallHeight;
      drawRoofOutline(ctx, roofType, ridgeHeight, offsetX, wallTopY, scaledWidth, scale, view, dims);
    }

    // Draw gates
    dims.gates.forEach((gate) => {
      if (gate.position === view) {
        const gateScaledWidth = gate.width * scale;
        const gateScaledHeight = gate.height * scale;
        const gateY = garageBottomY - (gate.offsetY * scale) - gateScaledHeight;
        let gateX = offsetX + gate.offsetX * scale;

        if (gate.position === 'back') {
          gateX = offsetX + (length - gate.offsetX - gate.width) * scale;
        } else if (gate.position === 'right') {
          gateX = offsetX + (width - gate.offsetX - gate.width) * scale;
        }

        ctx.fillStyle = '#fef2f2';
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 3;
        
        ctx.beginPath();
        ctx.rect(gateX, gateY, gateScaledWidth, gateScaledHeight);
        ctx.fill();
        ctx.stroke();

        // Gate details
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (gate.type === 'tilt') {
          // Draw 3 horizontal lines instead of middle vertical line
          const lineSpacing = gateScaledHeight / 4;
          for (let i = 1; i <= 3; i++) {
            const y = gateY + i * lineSpacing;
            ctx.moveTo(gateX, y);
            ctx.lineTo(gateX + gateScaledWidth, y);
          }
        } else {
          ctx.moveTo(gateX + gateScaledWidth/2, gateY);
          ctx.lineTo(gateX + gateScaledWidth/2, gateY + gateScaledHeight);
        }
        ctx.stroke();

        // Draw dimensions
        drawDimension(ctx, gateX, gateY + gateScaledHeight + 20, gateX + gateScaledWidth, gateY + gateScaledHeight + 20, `Szerokość bramy: ${gate.width}cm`);
        drawDimension(ctx, gateX - 20, gateY, gateX - 20, gateY + gateScaledHeight, `Wysokość bramy: ${gate.height}cm`);
      }
    });

    // Draw doors
    dims.doors.forEach((door) => {
      if (door.position === view) {
        const doorScaledWidth = door.width * scale;
        const doorScaledHeight = door.height * scale;
        const doorY = garageBottomY - (door.offsetY * scale) - doorScaledHeight;
        let doorX = offsetX + door.offsetX * scale;
        const side = door.side;

        if (door.position === 'back') {
          doorX = offsetX + (length - door.offsetX - door.width) * scale;
        } else if (door.position === 'right') {
          doorX = offsetX + (width - door.offsetX - door.width) * scale;
        }

        ctx.fillStyle = '#f0fdf4';
        ctx.strokeStyle = '#16a34a';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.rect(doorX, doorY, doorScaledWidth, doorScaledHeight);
        ctx.fill();
        ctx.stroke();

        // Door details
        ctx.strokeStyle = '#16a34a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(doorX + doorScaledWidth/2, doorY);
        ctx.lineTo(doorX + doorScaledWidth/2, doorY + doorScaledHeight);
        ctx.stroke();

        // Draw door handle based on side
        if (side === 'left') {
          const handleX = doorX;
          const handleY = doorY + doorScaledHeight / 2;
          ctx.fillStyle = '#000000';
          ctx.beginPath();
          ctx.arc(handleX, handleY, 5, 0, 2 * Math.PI);
          ctx.fill();
        } else if (side === 'right') {
          const handleX = doorX + doorScaledWidth;
          const handleY = doorY + doorScaledHeight / 2;
          ctx.fillStyle = '#000000';
          ctx.beginPath();
          ctx.arc(handleX, handleY, 5, 0, 2 * Math.PI);
          ctx.fill();
        }

        // Draw dimensions
        drawDimension(ctx, doorX, doorY + doorScaledHeight + 20, doorX + doorScaledWidth, doorY + doorScaledHeight + 20, `Szerokość drzwi: ${door.width}cm`);
        drawDimension(ctx, doorX - 20, doorY, doorX - 20, doorY + doorScaledHeight, `Wysokość drzwi: ${door.height}cm`);
      }
    });

    // Draw windows
    dims.windows.forEach((window) => {
      if (window.position === view) {
        const winScaledWidth = window.width * scale;
        const winScaledHeight = window.height * scale;
        const winY = garageBottomY - (window.offsetY * scale) - winScaledHeight;
        let winX = offsetX + window.offsetX * scale;

        if (window.position === 'back') {
          winX = offsetX + (length - window.offsetX - window.width) * scale;
        } else if (window.position === 'right') {
          winX = offsetX + (width - window.offsetX - window.width) * scale;
        }

        ctx.fillStyle = '#dbeafe';
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.rect(winX, winY, winScaledWidth, winScaledHeight);
        ctx.fill();
        ctx.stroke();

        // Window details (cross)
        ctx.beginPath();
        ctx.moveTo(winX, winY + winScaledHeight / 2);
        ctx.lineTo(winX + winScaledWidth, winY + winScaledHeight / 2);
        ctx.moveTo(winX + winScaledWidth / 2, winY);
        ctx.lineTo(winX + winScaledWidth / 2, winY + winScaledHeight);
        ctx.stroke();

        // Draw dimensions
        drawDimension(ctx, winX, winY + winScaledHeight + 20, winX + winScaledWidth, winY + winScaledHeight + 20, `Szerokość okna: ${window.width}cm`);
        drawDimension(ctx, winX - 20, winY, winX - 20, winY + winScaledHeight, `Wysokość okna: ${window.height}cm`);
      }
    });

    // Draw canopy
    if (dims.canopy.enabled && dims.canopy.position === view) {
      const canopyScaledWidth = dims.canopy.width * scale;
      const canopyScaledDepth = dims.canopy.depth * scale;
      let canopyX = offsetX + dims.canopy.offsetX * scale;
      let canopyY = garageBottomY - (dims.canopy.offsetY * scale);

      if (dims.canopy.position === 'back') {
        canopyX = offsetX + (length - dims.canopy.offsetX - dims.canopy.width) * scale;
      } else if (dims.canopy.position === 'right') {
        canopyX = offsetX + (width - dims.canopy.offsetX - dims.canopy.width) * scale;
      }

      ctx.fillStyle = '#f1f5f9';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;

      // Draw canopy
      ctx.beginPath();
      if (dims.canopy.position === 'front') {
        ctx.moveTo(canopyX, canopyY);
        ctx.lineTo(canopyX + canopyScaledWidth, canopyY);
        ctx.lineTo(canopyX + canopyScaledWidth, canopyY + canopyScaledDepth);
        ctx.lineTo(canopyX, canopyY + canopyScaledDepth);
      } else if (dims.canopy.position === 'back') {
        ctx.moveTo(canopyX, canopyY);
        ctx.lineTo(canopyX + canopyScaledWidth, canopyY);
        ctx.lineTo(canopyX + canopyScaledWidth, canopyY + canopyScaledDepth);
        ctx.lineTo(canopyX, canopyY + canopyScaledDepth);
      } else if (dims.canopy.position === 'left') {
        ctx.moveTo(canopyX, canopyY);
        ctx.lineTo(canopyX + canopyScaledDepth, canopyY);
        ctx.lineTo(canopyX + canopyScaledDepth, canopyY + canopyScaledWidth);
        ctx.lineTo(canopyX, canopyY + canopyScaledWidth);
      } else if (dims.canopy.position === 'right') {
        ctx.moveTo(canopyX, canopyY);
        ctx.lineTo(canopyX + canopyScaledDepth, canopyY);
        ctx.lineTo(canopyX + canopyScaledDepth, canopyY + canopyScaledWidth);
        ctx.lineTo(canopyX, canopyY + canopyScaledWidth);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw dimensions
      if (dims.canopy.position === 'front' || dims.canopy.position === 'back') {
        drawDimension(ctx, canopyX, canopyY + canopyScaledDepth + 20, canopyX + canopyScaledWidth, canopyY + canopyScaledDepth + 20, `Szerokość wiaty: ${dims.canopy.width}cm`);
        drawDimension(ctx, canopyX - 20, canopyY, canopyX - 20, canopyY + canopyScaledDepth, `Głębokość wiaty: ${dims.canopy.depth}cm`);
      } else {
        drawDimension(ctx, canopyX, canopyY + canopyScaledWidth + 20, canopyX + canopyScaledDepth, canopyY + canopyScaledWidth + 20, `Głębokość wiaty: ${dims.canopy.depth}cm`);
        drawDimension(ctx, canopyX - 20, canopyY, canopyX - 20, canopyY + canopyScaledWidth, `Szerokość wiaty: ${dims.canopy.width}cm`);
      }
    }

    // Draw overall dimensions
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.font = '12px Arial';
    ctx.fillStyle = '#000000';

    if (view === 'front' || view === 'back') {
      drawDimension(ctx, offsetX, garageBottomY + 20, offsetX + scaledWidth, garageBottomY + 20, `Długość: ${length}cm`);
      drawDimension(ctx, offsetX - 20, garageBottomY, offsetX - 20, garageBottomY - scaledWallHeight, `Wysokość: ${height}cm`);
    } else {
      drawDimension(ctx, offsetX, garageBottomY + 20, offsetX + scaledWidth, garageBottomY + 20, `Szerokość: ${width}cm`);
      drawDimension(ctx, offsetX - 20, garageBottomY, offsetX - 20, garageBottomY - scaledWallHeight, `Wysokość: ${height}cm`);
    }
  };

  const drawRoofOutline = (
    ctx: CanvasRenderingContext2D,
    roofType: string,
    ridgeHeight: number,
    offsetX: number,
    offsetY: number,
    scaledWidth: number,
    scale: number,
    view: ViewType,
    dims: GarageDimensions
  ) => {
    const { length, width, height } = dims;
    const scaledRidgeHeight = ridgeHeight * scale;
    const scaledWallHeight = height * scale;

    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#e0e7ff';

    if (roofType === 'gable') {
      if (view === 'front' || view === 'back') {
        // Draw gable roof gable end for front/back view (triangle)
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY);
        ctx.lineTo(offsetX + scaledWidth/2, offsetY - (scaledRidgeHeight - scaledWallHeight));
        ctx.lineTo(offsetX + scaledWidth, offsetY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (view === 'left' || view === 'right') {
        // Draw gable roof slope for side view (rectangle)
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY);
        ctx.lineTo(offsetX + scaledWidth, offsetY);
        ctx.lineTo(offsetX + scaledWidth, offsetY - (scaledRidgeHeight - scaledWallHeight));
        ctx.lineTo(offsetX, offsetY - (scaledRidgeHeight - scaledWallHeight));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    } else if (roofType === 'shed') {
      if (view === 'front' || view === 'back') {
        // Draw shed roof profile for front/back view (right trapezoid)
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY); // bottom-left (at wall top)
        ctx.lineTo(offsetX + scaledWidth, offsetY); // bottom-right (at wall top)
        ctx.lineTo(offsetX + scaledWidth, offsetY - (scaledRidgeHeight - scaledWallHeight)); // top-right (at ridge height)
        ctx.lineTo(offsetX, offsetY); // top-left (at wall height)
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (view === 'left' || view === 'right') {
        // Draw shed roof for side view (trapezoid)
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY); // bottom-left (at wall top)
        ctx.lineTo(offsetX + scaledWidth, offsetY); // bottom-right (at wall top)
        ctx.lineTo(offsetX + scaledWidth, offsetY - (scaledRidgeHeight - scaledWallHeight)); // top-right (at ridge height)
        ctx.lineTo(offsetX, offsetY - (scaledRidgeHeight - scaledWallHeight)); // top-left (at ridge height)
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }
  };

  const drawDimension = (
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    label: string,
    vertical: boolean = false
  ) => {
    const arrowSize = 10;
    const textPadding = 5;

    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#64748b';
    ctx.font = '12px Arial';

    if (vertical) {
      // Vertical dimension line
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x1, y2);
      ctx.stroke();

      // Arrow heads
      ctx.beginPath();
      ctx.moveTo(x1 - arrowSize, y1 + arrowSize);
      ctx.lineTo(x1, y1);
      ctx.lineTo(x1 + arrowSize, y1 + arrowSize);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x1 - arrowSize, y2 - arrowSize);
      ctx.lineTo(x1, y2);
      ctx.lineTo(x1 + arrowSize, y2 - arrowSize);
      ctx.stroke();

      // Text
      const textWidth = ctx.measureText(label).width;
      ctx.fillText(label, x1 - textWidth / 2, (y1 + y2) / 2);
    } else {
      // Horizontal dimension line
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y1);
      ctx.stroke();

      // Arrow heads
      ctx.beginPath();
      ctx.moveTo(x1 + arrowSize, y1 - arrowSize);
      ctx.lineTo(x1, y1);
      ctx.lineTo(x1 + arrowSize, y1 + arrowSize);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x2 - arrowSize, y1 - arrowSize);
      ctx.lineTo(x2, y1);
      ctx.lineTo(x2 - arrowSize, y1 + arrowSize);
      ctx.stroke();

      // Text
      const textWidth = ctx.measureText(label).width;
      ctx.fillText(label, (x1 + x2) / 2 - textWidth / 2, y1 - textPadding);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ backgroundColor: '#ffffff' }}
    />
  );
};
