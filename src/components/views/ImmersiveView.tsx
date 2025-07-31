import { useEffect, useRef } from 'react';
import { GarageDimensions } from '@/pages/Index';

interface ImmersiveViewProps {
  dimensions: GarageDimensions;
}

export const ImmersiveView = ({ dimensions }: ImmersiveViewProps) => {
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

    // Draw 3D isometric garage
    drawIsometricGarage(ctx, dimensions, canvas.offsetWidth, canvas.offsetHeight);
  }, [dimensions]);

  const drawIsometricGarage = (
    ctx: CanvasRenderingContext2D, 
    dims: GarageDimensions, 
    canvasWidth: number, 
    canvasHeight: number
  ) => {
    // Calculate adaptive scale based on garage dimensions and canvas size
    const maxDimension = Math.max(dims.length, dims.width, dims.height);
    const ridgeHeight = dims.roofType === 'flat' 
      ? dims.height 
      : dims.ridgeHeight;
    
    const totalHeight = Math.max(ridgeHeight, dims.height);
    const totalDimension = Math.max(maxDimension, totalHeight);
    
    // Adaptive scaling with padding
    const padding = 50;
    const availableWidth = canvasWidth - 2 * padding;
    const availableHeight = canvasHeight - 2 * padding;
    const scale = Math.min(
      availableWidth / (totalDimension * 1.5), 
      availableHeight / (totalDimension * 1.2)
    ) * 0.6;

    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2 + totalDimension * scale * 0.1;

    // Isometric transformation
    const isoX = (x: number, y: number) => centerX + (x - y) * Math.cos(Math.PI / 6) * scale;
    const isoY = (x: number, y: number, z: number) => centerY + (x + y) * Math.sin(Math.PI / 6) * scale - z * scale;

    const { length, width, height } = dims;

    // Base coordinates
    const basePoints = [
      [0, 0, 0],
      [length, 0, 0],
      [length, width, 0],
      [0, width, 0]
    ];

    // Top coordinates
    const topPoints = [
      [0, 0, height],
      [length, 0, height],
      [length, width, height],
      [0, width, height]
    ];

    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#e0e7ff';

    // Draw base
    ctx.beginPath();
    ctx.moveTo(isoX(basePoints[0][0], basePoints[0][1]), isoY(basePoints[0][0], basePoints[0][1], basePoints[0][2]));
    for (let i = 1; i < basePoints.length; i++) {
      ctx.lineTo(isoX(basePoints[i][0], basePoints[i][1]), isoY(basePoints[i][0], basePoints[i][1], basePoints[i][2]));
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw walls (in proper order for depth)
    drawWalls(ctx, basePoints, topPoints, isoX, isoY);

    // Draw elements BEFORE roof so they appear behind it
    drawGates(ctx, dims, isoX, isoY);
    drawDoors(ctx, dims, isoX, isoY);
    drawWindows(ctx, dims, isoX, isoY);
    drawCanopy(ctx, dims, isoX, isoY);

    // Draw roof LAST so it's on top
    drawIsometricRoof(ctx, dims, scale, centerX, centerY, isoX, isoY);

    // Add dimension labels
    addDimensionLabels(ctx, dims, isoX, isoY);
  };

  const drawWalls = (
    ctx: CanvasRenderingContext2D,
    basePoints: number[][],
    topPoints: number[][],
    isoX: (x: number, y: number) => number,
    isoY: (x: number, y: number, z: number) => number
  ) => {
    // Draw walls in back-to-front order for proper depth
    const wallOrder = [2, 3, 1, 0]; // back, left, right, front
    const wallColors = ['#d1d5db', '#e5e7eb', '#e5e7eb', '#f3f4f6'];
    
    wallOrder.forEach((i, index) => {
      const nextI = (i + 1) % basePoints.length;
      
      ctx.beginPath();
      ctx.moveTo(isoX(basePoints[i][0], basePoints[i][1]), isoY(basePoints[i][0], basePoints[i][1], basePoints[i][2]));
      ctx.lineTo(isoX(topPoints[i][0], topPoints[i][1]), isoY(topPoints[i][0], topPoints[i][1], topPoints[i][2]));
      ctx.lineTo(isoX(topPoints[nextI][0], topPoints[nextI][1]), isoY(topPoints[nextI][0], topPoints[nextI][1], topPoints[nextI][2]));
      ctx.lineTo(isoX(basePoints[nextI][0], basePoints[nextI][1]), isoY(basePoints[nextI][0], basePoints[nextI][1], basePoints[nextI][2]));
      ctx.closePath();
      
      ctx.fillStyle = wallColors[index];
      ctx.fill();
      ctx.stroke();
    });
  };

  const drawGates = (
    ctx: CanvasRenderingContext2D,
    dims: GarageDimensions,
    isoX: (x: number, y: number) => number,
    isoY: (x: number, y: number, z: number) => number
  ) => {
    const { length, width } = dims;

    dims.gates.forEach((gate) => {
      const { width: gateWidth, height: gateHeight, position, offsetX, offsetY, type } = gate;

      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2;
      ctx.fillStyle = '#fef2f2';

      let x1, y1, x2, y2, x3, y3, x4, y4;

      switch (position) {
        case 'front':
          x1 = offsetX;
          y1 = 0;
          x2 = offsetX + gateWidth;
          y2 = 0;
          x3 = offsetX + gateWidth;
          y3 = gateHeight;
          x4 = offsetX;
          y4 = gateHeight;
          break;
        case 'back':
          x1 = length - offsetX - gateWidth;
          y1 = width;
          x2 = length - offsetX;
          y2 = width;
          x3 = length - offsetX;
          y3 = width;
          x4 = length - offsetX - gateWidth;
          y4 = width;
          break;
        case 'left':
          x1 = 0;
          y1 = offsetX;
          x2 = 0;
          y2 = offsetX + gateWidth;
          x3 = 0;
          y3 = offsetX + gateWidth;
          x4 = 0;
          y4 = offsetX;
          break;
        case 'right':
          x1 = length;
          y1 = width - offsetX - gateWidth;
          x2 = length;
          y2 = width - offsetX;
          x3 = length;
          y3 = width - offsetX;
          x4 = length;
          y4 = width - offsetX - gateWidth;
          break;
        default:
          return;
      }

      // Draw gate
      ctx.beginPath();
      ctx.moveTo(isoX(x1, y1), isoY(x1, y1, offsetY));
      ctx.lineTo(isoX(x2, y2), isoY(x2, y2, offsetY));
      ctx.lineTo(isoX(x3, y3), isoY(x3, y3, offsetY + gateHeight));
      ctx.lineTo(isoX(x4, y4), isoY(x4, y4, offsetY + gateHeight));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

        // Draw gate details
        ctx.beginPath();
        if (type === 'tilt') {
          // Do not draw lines for tilt gate in immersive view
        } else {
          // Draw middle vertical line for standard gate
          ctx.moveTo(isoX((x1 + x2) / 2, (y1 + y2) / 2), isoY((x1 + x2) / 2, (y1 + y2) / 2, offsetY));
          ctx.lineTo(isoX((x3 + x4) / 2, (y3 + y4) / 2), isoY((x3 + x4) / 2, (y3 + y4) / 2, offsetY + gateHeight));
        }
        ctx.stroke();
    });
  };

  const drawDoors = (
    ctx: CanvasRenderingContext2D,
    dims: GarageDimensions,
    isoX: (x: number, y: number) => number,
    isoY: (x: number, y: number, z: number) => number
  ) => {
    const { length, width } = dims;

    dims.doors.forEach((door) => {
      const { width: doorWidth, height: doorHeight, position, offsetX, offsetY, side } = door;

      ctx.strokeStyle = '#16a34a';
      ctx.lineWidth = 2;
      ctx.fillStyle = '#f0fdf4';

      let x1, y1, x2, y2, x3, y3, x4, y4;

      switch (position) {
        case 'front':
          x1 = offsetX;
          y1 = 0;
          x2 = offsetX + doorWidth;
          y2 = 0;
          x3 = offsetX + doorWidth;
          y3 = doorHeight;
          x4 = offsetX;
          y4 = doorHeight;
          break;
        case 'back':
          x1 = length - offsetX - doorWidth;
          y1 = width;
          x2 = length - offsetX;
          y2 = width;
          x3 = length - offsetX;
          y3 = width;
          x4 = length - offsetX - doorWidth;
          y4 = width;
          break;
        case 'left':
          x1 = 0;
          y1 = offsetX;
          x2 = 0;
          y2 = offsetX + doorWidth;
          x3 = 0;
          y3 = offsetX + doorWidth;
          x4 = 0;
          y4 = offsetX;
          break;
        case 'right':
          x1 = length;
          y1 = width - offsetX - doorWidth;
          x2 = length;
          y2 = width - offsetX;
          x3 = length;
          y3 = width - offsetX;
          x4 = length;
          y4 = width - offsetX - doorWidth;
          break;
        default:
          return;
      }

      // Draw door
      ctx.beginPath();
      ctx.moveTo(isoX(x1, y1), isoY(x1, y1, offsetY));
      ctx.lineTo(isoX(x2, y2), isoY(x2, y2, offsetY));
      ctx.lineTo(isoX(x3, y3), isoY(x3, y3, offsetY + doorHeight));
      ctx.lineTo(isoX(x4, y4), isoY(x4, y4, offsetY + doorHeight));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw door details
      ctx.beginPath();
      ctx.moveTo(isoX((x1 + x2) / 2, (y1 + y2) / 2), isoY((x1 + x2) / 2, (y1 + y2) / 2, offsetY));
      ctx.lineTo(isoX((x3 + x4) / 2, (y3 + y4) / 2), isoY((x3 + x4) / 2, (y3 + y4) / 2, offsetY + doorHeight));
      ctx.stroke();

      // Draw door handle based on side
      if (side === 'left') {
        const handleX = isoX(x1, y1);
        const handleY = isoY(x1, y1, offsetY + doorHeight / 2);
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(handleX, handleY, 5, 0, 2 * Math.PI);
        ctx.fill();
      } else if (side === 'right') {
        const handleX = isoX(x2, y2);
        const handleY = isoY(x2, y2, offsetY + doorHeight / 2);
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(handleX, handleY, 5, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  };

  const drawWindows = (
    ctx: CanvasRenderingContext2D,
    dims: GarageDimensions,
    isoX: (x: number, y: number) => number,
    isoY: (x: number, y: number, z: number) => number
  ) => {
    const { length, width } = dims;

    dims.windows.forEach((window) => {
      const { width: winWidth, height: winHeight, position, offsetX, offsetY } = window;

      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.fillStyle = '#dbeafe';

      let x1, y1, x2, y2, x3, y3, x4, y4;

      switch (position) {
        case 'front':
          x1 = offsetX;
          y1 = 0;
          x2 = offsetX + winWidth;
          y2 = 0;
          x3 = offsetX + winWidth;
          y3 = winHeight;
          x4 = offsetX;
          y4 = winHeight;
          break;
        case 'back':
          x1 = length - offsetX - winWidth;
          y1 = width;
          x2 = length - offsetX;
          y2 = width;
          x3 = length - offsetX;
          y3 = width;
          x4 = length - offsetX - winWidth;
          y4 = width;
          break;
        case 'left':
          x1 = 0;
          y1 = offsetX;
          x2 = 0;
          y2 = offsetX + winWidth;
          x3 = 0;
          y3 = offsetX + winWidth;
          x4 = 0;
          y4 = offsetX;
          break;
        case 'right':
          x1 = length;
          y1 = width - offsetX - winWidth;
          x2 = length;
          y2 = width - offsetX;
          x3 = length;
          y3 = width - offsetX;
          x4 = length;
          y4 = width - offsetX - winWidth;
          break;
        default:
          return;
      }

      // Draw window
      ctx.beginPath();
      ctx.moveTo(isoX(x1, y1), isoY(x1, y1, offsetY));
      ctx.lineTo(isoX(x2, y2), isoY(x2, y2, offsetY));
      ctx.lineTo(isoX(x3, y3), isoY(x3, y3, offsetY + winHeight));
      ctx.lineTo(isoX(x4, y4), isoY(x4, y4, offsetY + winHeight));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw window details (cross)
      ctx.beginPath();
      ctx.moveTo(isoX(x1, y1), isoY(x1, y1, offsetY + winHeight / 2));
      ctx.lineTo(isoX(x2, y2), isoY(x2, y2, offsetY + winHeight / 2));
      ctx.moveTo(isoX((x1 + x2) / 2, (y1 + y2) / 2), isoY((x1 + x2) / 2, (y1 + y2) / 2, offsetY));
      ctx.lineTo(isoX((x1 + x2) / 2, (y1 + y2) / 2), isoY((x1 + x2) / 2, (y1 + y2) / 2, offsetY + winHeight));
      ctx.stroke();
    });
  };

  const drawCanopy = (
    ctx: CanvasRenderingContext2D,
    dims: GarageDimensions,
    isoX: (x: number, y: number) => number,
    isoY: (x: number, y: number, z: number) => number
  ) => {
    if (!dims.canopy.enabled) return;

    const { length, width } = dims;
    const { width: canopyWidth, depth: canopyDepth, position, offsetX, offsetY } = dims.canopy;

    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#f1f5f9';

    let x1, y1, x2, y2, x3, y3, x4, y4;

    switch (position) {
      case 'front':
        x1 = offsetX;
        y1 = -canopyDepth;
        x2 = offsetX + canopyWidth;
        y2 = -canopyDepth;
        x3 = offsetX + canopyWidth;
        y3 = 0;
        x4 = offsetX;
        y4 = 0;
        break;
      case 'back':
        x1 = length - offsetX - canopyWidth;
        y1 = width + canopyDepth;
        x2 = length - offsetX;
        y2 = width + canopyDepth;
        x3 = length - offsetX;
        y3 = width;
        x4 = length - offsetX - canopyWidth;
        y4 = width;
        break;
      case 'left':
        x1 = -canopyDepth;
        y1 = offsetX;
        x2 = 0;
        y2 = offsetX;
        x3 = 0;
        y3 = offsetX + canopyWidth;
        x4 = -canopyDepth;
        y4 = offsetX + canopyWidth;
        break;
      case 'right':
        x1 = length;
        y1 = offsetX;
        x2 = length + canopyDepth;
        y2 = offsetX;
        x3 = length + canopyDepth;
        y3 = offsetX + canopyWidth;
        x4 = length;
        y4 = offsetX + canopyWidth;
        break;
      default:
        return;
    }

    // Draw canopy
    ctx.beginPath();
    ctx.moveTo(isoX(x1, y1), isoY(x1, y1, offsetY));
    ctx.lineTo(isoX(x2, y2), isoY(x2, y2, offsetY));
    ctx.lineTo(isoX(x3, y3), isoY(x3, y3, offsetY));
    ctx.lineTo(isoX(x4, y4), isoY(x4, y4, offsetY));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  const drawIsometricRoof = (
    ctx: CanvasRenderingContext2D,
    dims: GarageDimensions,
    scale: number,
    centerX: number,
    centerY: number,
    isoX: (x: number, y: number) => number,
    isoY: (x: number, y: number, z: number) => number
  ) => {
    const { length, width, height, roofType, ridgeHeight } = dims;
    
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#8A2BE2';

    // Base points for roof (these are the top points of the garage walls)
    const garageTopPoints = [
      [0, 0, height], // p0: front-left top
      [length, 0, height], // p1: front-right top
      [length, width, height], // p2: back-right top
      [0, width, height] // p3: back-left top
    ];

    if (roofType === 'flat') {
      // Draw flat roof
      ctx.beginPath();
      ctx.moveTo(isoX(garageTopPoints[0][0], garageTopPoints[0][1]), isoY(garageTopPoints[0][0], garageTopPoints[0][1], garageTopPoints[0][2]));
      for (let i = 1; i < garageTopPoints.length; i++) {
        ctx.lineTo(isoX(garageTopPoints[i][0], garageTopPoints[i][1]), isoY(garageTopPoints[i][0], garageTopPoints[i][1], garageTopPoints[i][2]));
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (roofType === 'gable') {
      // Draw gable roof
      // Ridge runs along the length (X-axis), gables are on the width (Y-axis) ends
      const ridgePoints = [
        [0, width/2, ridgeHeight],   // r0: Ridge point on the left side
        [length, width/2, ridgeHeight] // r1: Ridge point on the right side
      ];

      // Define vertices for the gable roof (for clarity)
      const p0 = garageTopPoints[0]; // front-left top [0, 0, height]
      const p1 = garageTopPoints[1]; // front-right top [length, 0, height]
      const p2 = garageTopPoints[2]; // back-right top [length, width, height]
      const p3 = garageTopPoints[3]; // back-left top [0, width, height]

      const r0 = ridgePoints[0]; // left ridge point
      const r1 = ridgePoints[1]; // right ridge point

      // Define the faces of the gable roof
      const gableFaces = [
        // Face 1: Back Slope (rectangle) - at y=width side
        { points: [p3, p2, r1, r0], color: ctx.fillStyle },
        // Face 2: Right Gable (triangle) - at x=length end
        { points: [p1, p2, r1], color: ctx.fillStyle },
        // Face 3: Left Gable (triangle) - at x=0 end
        { points: [p0, p3, r0], color: ctx.fillStyle },
        // Face 4: Front Slope (rectangle) - at y=0 side
        { points: [p0, p1, r1, r0], color: ctx.fillStyle }
      ];

      // Sort faces by average isometric Y coordinate for proper occlusion (back to front)
      gableFaces.sort((a, b) => {
        const avgY_a = a.points.reduce((sum, p) => sum + isoY(p[0], p[1], p[2]), 0) / a.points.length;
        const avgY_b = b.points.reduce((sum, p) => sum + isoY(p[0], p[1], p[2]), 0) / b.points.length;
        return avgY_a - avgY_b;
      });

      // Draw filled faces
      gableFaces.forEach(face => {
        ctx.fillStyle = face.color; // Set fill color for each face
        ctx.beginPath();
        ctx.moveTo(isoX(face.points[0][0], face.points[0][1]), isoY(face.points[0][0], face.points[0][1], face.points[0][2]));
        for (let i = 1; i < face.points.length; i++) {
          ctx.lineTo(isoX(face.points[i][0], face.points[i][1]), isoY(face.points[i][0], face.points[i][1], face.points[i][2]));
        }
        ctx.closePath();
        ctx.fill();
      });

      // Draw strokes for all edges (after all fills are done)
      ctx.strokeStyle = '#2563eb'; // Use the same stroke color as on the image
      ctx.lineWidth = 2;

      const edges = [
        [p0, p1], // Front top garage edge
        [p1, p2], // Right top garage edge
        [p2, p3], // Back top garage edge
        [p3, p0], // Left top garage edge

        [p0, r0], // Left gable bottom-front
        [p3, r0], // Left gable bottom-back
        [p1, r1], // Right gable bottom-front
        [p2, r1], // Right gable bottom-back

        [r0, r1]  // Ridge line
      ];

      edges.forEach(edge => {
        ctx.beginPath();
        ctx.moveTo(isoX(edge[0][0], edge[0][1]), isoY(edge[0][0], edge[0][1], edge[0][2]));
        ctx.lineTo(isoX(edge[1][0], edge[1][1]), isoY(edge[1][0], edge[1][1], edge[1][2]));
        ctx.stroke();
      });

    } else if (roofType === 'shed') {
      // Draw shed roof
      // Slope is across the width (Y-axis), so the front edge is at `height` and back edge is at `ridgeHeight`
      const lowPoints = [
        [0, 0, height],   // front-left low point
        [length, 0, height] // front-right low point
      ];
      const highPoints = [
        [0, width, ridgeHeight],   // back-left high point
        [length, width, ridgeHeight] // back-right high point
      ];

      // Define the faces of the shed roof for proper occlusion (back to front)
      const shedFaces = [
        // Face 1: Main sloped roof surface (farthest slope based on common view)
        { points: [highPoints[0], highPoints[1], lowPoints[1], lowPoints[0]], color: ctx.fillStyle },
        
        // Face 2: Back vertical face (highest side)
        { points: [garageTopPoints[3], garageTopPoints[2], highPoints[1], highPoints[0]], color: ctx.fillStyle },
        
        // Face 3: Left sloped vertical face (trapezoid)
        { points: [garageTopPoints[0], garageTopPoints[3], highPoints[0], lowPoints[0]], color: ctx.fillStyle },

        // Face 4: Right sloped vertical face (trapezoid)
        { points: [garageTopPoints[1], garageTopPoints[2], highPoints[1], lowPoints[1]], color: ctx.fillStyle },
        
        // Face 5: Front vertical face (lowest side)
        { points: [garageTopPoints[0], garageTopPoints[1], lowPoints[1], lowPoints[0]], color: ctx.fillStyle }
      ];

      // Sort faces by average isometric Y coordinate for proper occlusion (back to front)
      shedFaces.sort((a, b) => {
        const avgY_a = a.points.reduce((sum, p) => sum + isoY(p[0], p[1], p[2]), 0) / a.points.length;
        const avgY_b = b.points.reduce((sum, p) => sum + isoY(p[0], p[1], p[2]), 0) / b.points.length;
        return avgY_a - avgY_b;
      });

      // Draw filled faces
      shedFaces.forEach(face => {
        ctx.fillStyle = face.color; // Set fill color for each face
        ctx.beginPath();
        ctx.moveTo(isoX(face.points[0][0], face.points[0][1]), isoY(face.points[0][0], face.points[0][1], face.points[0][2]));
        for (let i = 1; i < face.points.length; i++) {
          ctx.lineTo(isoX(face.points[i][0], face.points[i][1]), isoY(face.points[i][0], face.points[i][1], face.points[i][2]));
        }
        ctx.closePath();
        ctx.fill();
      });

      // Draw strokes for all edges (after all fills are done)
      ctx.strokeStyle = '#2563eb'; // Use the same stroke color for all roof edges
      ctx.lineWidth = 2;

      const shedEdges = [
        // Top outline (sloped surface)
        [lowPoints[0], lowPoints[1]],
        [lowPoints[1], highPoints[1]],
        [highPoints[1], highPoints[0]],
        [highPoints[0], lowPoints[0]],

        // Vertical edges connecting roof to walls
        [garageTopPoints[0], lowPoints[0]],
        [garageTopPoints[1], lowPoints[1]],
        [garageTopPoints[2], highPoints[1]],
        [garageTopPoints[3], highPoints[0]]
      ];

      shedEdges.forEach(edge => {
        ctx.beginPath();
        ctx.moveTo(isoX(edge[0][0], edge[0][1]), isoY(edge[0][0], edge[0][1], edge[0][2]));
        ctx.lineTo(isoX(edge[1][0], edge[1][1]), isoY(edge[1][0], edge[1][1], edge[1][2]));
        ctx.stroke();
      });
    }
  };

  const addDimensionLabels = (
    ctx: CanvasRenderingContext2D,
    dims: GarageDimensions,
    isoX: (x: number, y: number) => number,
    isoY: (x: number, y: number, z: number) => number
  ) => {
    const { length, width, height, roofType, roofAngle } = dims;
    
    ctx.textAlign = 'left';
    ctx.font = '12px Arial';
    
    // Helper function to draw text with white background
    const drawTextWithBackground = (text: string, x: number, y: number) => {
      const padding = 4;
      const textWidth = ctx.measureText(text).width;
      
      // Draw white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x - padding, y - 12 - padding, textWidth + (padding * 2), 16 + (padding * 2));
      
      // Draw text
      ctx.fillStyle = '#374151';
      ctx.fillText(text, x, y);
    };
    
    // Length dimension on front wall (moved to the left)
    const lengthLabelX = isoX(length/2, -50);
    const lengthLabelY = isoY(length/2, -50, height/2);
    drawTextWithBackground(`Długość: ${length}cm`, lengthLabelX, lengthLabelY);
    
    // Width dimension (moved to the left)
    const widthLabelX = isoX(-50, width/2);
    const widthLabelY = isoY(-50, width/2, 0);
    drawTextWithBackground(`Szerokość: ${width}cm`, widthLabelX, widthLabelY);
    
    // Height dimension on nearest visible pillar (moved to the left)
    const heightLabelX = isoX(-50, 0);
    const heightLabelY = isoY(-50, 0, height/2);
    drawTextWithBackground(`Wysokość: ${height}cm`, heightLabelX, heightLabelY);

    // Ridge height for gable and shed roofs
    if (roofType !== 'flat') {
      const ridgeHeight = dims.ridgeHeight;
      
      // Positioning the ridge height label on the left side
      const ridgeLabelX = isoX(-50, width/2);
      const ridgeLabelY = isoY(-50, width/2, ridgeHeight + 30);
      drawTextWithBackground(`Kalenica: ${Math.round(ridgeHeight)}cm`, ridgeLabelX, ridgeLabelY);
    }
  };

  return (
    <div className="w-full h-full relative">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-sm">
        <p className="text-sm font-medium text-slate-700">Widok 3D Immersyjny</p>
      </div>
    </div>
  );
};
