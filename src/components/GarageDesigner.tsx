
import { useEffect, useRef } from 'react';
import { GarageDimensions, ViewType } from '@/pages/Index';
import { ImmersiveView } from './views/ImmersiveView';
import { OrthographicView } from './views/OrthographicView';

interface GarageDesignerProps {
  dimensions: GarageDimensions;
  viewType: ViewType;
}

export const GarageDesigner = ({ dimensions, viewType }: GarageDesignerProps) => {
  if (viewType === 'immersive') {
    return <ImmersiveView dimensions={dimensions} />;
  }

  return <OrthographicView dimensions={dimensions} viewType={viewType} />;
};
