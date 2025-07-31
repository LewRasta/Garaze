import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { GarageDimensions } from '@/pages/Index';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface DimensionControlsProps {
  dimensions: GarageDimensions;
  onChange: (dimensions: GarageDimensions) => void;
}

export const DimensionControls = ({ dimensions, onChange }: DimensionControlsProps) => {
  const updateDimension = (key: keyof GarageDimensions, value: any) => {
    onChange({ ...dimensions, [key]: value });
  };

  const addGate = () => {
    if (dimensions.gates.length >= 4) return;
    const newGates = [...dimensions.gates, {
      width: 200,
      height: 200,
      position: 'front' as const,
      offsetX: 0,
      offsetY: 0,
      type: 'standard' as const
    }];
    updateDimension('gates', newGates);
  };

  const removeGate = (index: number) => {
    const newGates = dimensions.gates.filter((_, i) => i !== index);
    updateDimension('gates', newGates);
  };

  const updateGate = (index: number, field: string, value: any) => {
    const newGates = [...dimensions.gates];
    newGates[index] = { ...newGates[index], [field]: value };
    updateDimension('gates', newGates);
  };

  const addDoor = () => {
    const newDoors = [...dimensions.doors, {
      width: 90,
      height: 200,
      position: 'front' as const,
      offsetX: 0,
      offsetY: 0,
      side: 'left' as const
    }];
    updateDimension('doors', newDoors);
  };

  const removeDoor = (index: number) => {
    const newDoors = dimensions.doors.filter((_, i) => i !== index);
    updateDimension('doors', newDoors);
  };

  const updateDoor = (index: number, field: string, value: any) => {
    const newDoors = [...dimensions.doors];
    newDoors[index] = { ...newDoors[index], [field]: value };
    updateDimension('doors', newDoors);
  };

    const addWindow = () => {
    if (dimensions.windows.length >= 6) return;
    const newWindows = [...dimensions.windows, {
      width: 80,
      height: 60,
      position: 'front' as const,
      offsetX: 0,
      offsetY: 125
    }];
    updateDimension('windows', newWindows);
  };

  const removeWindow = (index: number) => {
    const newWindows = dimensions.windows.filter((_, i) => i !== index);
    updateDimension('windows', newWindows);
  };

  const updateWindow = (index: number, field: string, value: any) => {
    const newWindows = [...dimensions.windows];
    newWindows[index] = { ...newWindows[index], [field]: value };
    updateDimension('windows', newWindows);
  };

  const getMaxOffset = (position: string, elementWidth: number) => {
    if (position === 'front' || position === 'back') {
      return dimensions.length - elementWidth;
    } else { // 'left' or 'right'
      return dimensions.width - elementWidth;
    }
  };

  return (
    <div className="space-y-4">
      {/* Garage Dimensions */}
      <div className="space-y-3">
        <div>
          <Label htmlFor="length" className="text-sm font-medium">Długość (cm)</Label>
          <Input
            id="length"
            type="number"
            value={dimensions.length}
            onChange={(e) => updateDimension('length', parseInt(e.target.value) || 0)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="width" className="text-sm font-medium">Szerokość (cm)</Label>
          <Input
            id="width"
            type="number"
            value={dimensions.width}
            onChange={(e) => updateDimension('width', parseInt(e.target.value) || 0)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="height" className="text-sm font-medium">Wysokość (cm)</Label>
          <Input
            id="height"
            type="number"
            value={dimensions.height}
            onChange={(e) => updateDimension('height', parseInt(e.target.value) || 0)}
            className="mt-1"
          />
        </div>
      </div>

      <Separator />

      {/* Roof Settings */}
      <div className="space-y-3">
        <div>
          <Label className="text-sm font-medium">Typ dachu</Label>
          <Select
            value={dimensions.roofType}
            onValueChange={(value) => {
              updateDimension('roofType', value);
            }}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="flat">Płaski</SelectItem>
              <SelectItem value="gable">Dwuspadowy</SelectItem>
              <SelectItem value="shed">Jednospadowy</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {dimensions.roofType !== 'flat' && (
          <div>
            <Label className="text-sm font-medium">Wysokość do kalenicy: {dimensions.ridgeHeight} cm</Label>
            <Slider
              value={[dimensions.ridgeHeight]}
              onValueChange={([value]) => updateDimension('ridgeHeight', value)}
              max={dimensions.height + 200}
              min={dimensions.height + 20}
              step={1}
              className="mt-2"
            />
          </div>
        )}
      </div>

      <Separator />

      {/* Gates */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-medium">Bramy ({dimensions.gates.length}/4)</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={addGate}
            disabled={dimensions.gates.length >= 4}
          >
            <Plus className="h-4 w-4 mr-1" />
            Dodaj bramę
          </Button>
        </div>

        {dimensions.gates.map((gate, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium">Brama {index + 1}</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeGate(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div>
              <Label htmlFor={`gate-width-${index}`} className="text-sm font-medium">Szerokość (cm)</Label>
              <Input
                id={`gate-width-${index}`}
                type="number"
                value={gate.width}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  if (value <= getMaxOffset(gate.position, 0)) {
                    updateGate(index, 'width', value);
                  }
                }}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor={`gate-height-${index}`} className="text-sm font-medium">Wysokość (cm)</Label>
              <Input
                id={`gate-height-${index}`}
                type="number"
                value={gate.height}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  if (value <= dimensions.height) {
                    updateGate(index, 'height', value);
                  }
                }}
                className="mt-1"
              />
            </div>

            <div>
        <Label className="text-sm font-medium">Pozycja</Label>
        <Select value={gate.position} onValueChange={(value) => updateGate(index, 'position', value)}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="front">Z przodu</SelectItem>
            <SelectItem value="back">Z tyłu</SelectItem>
            <SelectItem value="left">Z lewej</SelectItem>
            <SelectItem value="right">Z prawej</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-sm font-medium">Typ bramy</Label>
        <Select value={gate.type} onValueChange={(value) => updateGate(index, 'type', value)}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">Otwierana</SelectItem>
            <SelectItem value="tilt">Uchylna</SelectItem>
          </SelectContent>
        </Select>
      </div>

            <div>
              <Label htmlFor={`gate-offset-x-${index}`} className="text-sm font-medium">Przesunięcie X (cm)</Label>
              <Input
                id={`gate-offset-x-${index}`}
                type="number"
                value={gate.offsetX}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  if (value >= 0 && value <= getMaxOffset(gate.position, gate.width)) {
                    updateGate(index, 'offsetX', value);
                  }
                }}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor={`gate-offset-y-${index}`} className="text-sm font-medium">Przesunięcie Y (cm)</Label>
              <Input
                id={`gate-offset-y-${index}`}
                type="number"
                value={gate.offsetY}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  if (value >= 0 && value <= dimensions.height - gate.height) {
                    updateGate(index, 'offsetY', value);
                  }
                }}
                className="mt-1"
              />
            </div>
          </div>
        ))}
      </div>

      <Separator />

      {/* Doors */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-medium">Drzwi</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={addDoor}
          >
            <Plus className="h-4 w-4 mr-1" />
            Dodaj drzwi
          </Button>
        </div>

        {dimensions.doors.map((door, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium">Drzwi {index + 1}</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeDoor(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div>
              <Label htmlFor={`door-width-${index}`} className="text-sm font-medium">Szerokość (cm)</Label>
              <Input
                id={`door-width-${index}`}
                type="number"
                value={door.width}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  if (value <= getMaxOffset(door.position, 0)) {
                    updateDoor(index, 'width', value);
                  }
                }}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor={`door-height-${index}`} className="text-sm font-medium">Wysokość (cm)</Label>
              <Input
                id={`door-height-${index}`}
                type="number"
                value={door.height}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  if (value <= dimensions.height) {
                    updateDoor(index, 'height', value);
                  }
                }}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Pozycja</Label>
              <Select value={door.position} onValueChange={(value) => updateDoor(index, 'position', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="front">Z przodu</SelectItem>
                  <SelectItem value="back">Z tyłu</SelectItem>
                  <SelectItem value="left">Z lewej</SelectItem>
                  <SelectItem value="right">Z prawej</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">Strona drzwi</Label>
              <Select value={door.side} onValueChange={(value) => updateDoor(index, 'side', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Lewa</SelectItem>
                  <SelectItem value="right">Prawa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor={`door-offset-x-${index}`} className="text-sm font-medium">Przesunięcie X (cm)</Label>
              <Input
                id={`door-offset-x-${index}`}
                type="number"
                value={door.offsetX}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  if (value >= 0 && value <= getMaxOffset(door.position, door.width)) {
                    updateDoor(index, 'offsetX', value);
                  }
                }}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor={`door-offset-y-${index}`} className="text-sm font-medium">Przesunięcie Y (cm)</Label>
              <Input
                id={`door-offset-y-${index}`}
                type="number"
                value={door.offsetY}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  if (value >= 0 && value <= dimensions.height - door.height) {
                    updateDoor(index, 'offsetY', value);
                  }
                }}
                className="mt-1"
              />
            </div>
          </div>
        ))}
      </div>

      <Separator />

      {/* Windows */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-medium">Okna ({dimensions.windows.length}/6)</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={addWindow}
            disabled={dimensions.windows.length >= 6}
          >
            <Plus className="h-4 w-4 mr-1" />
            Dodaj okno
          </Button>
        </div>

        {dimensions.windows.map((window, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium">Okno {index + 1}</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeWindow(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div>
              <Label htmlFor={`window-width-${index}`} className="text-sm font-medium">Szerokość (cm)</Label>
              <Input
                id={`window-width-${index}`}
                type="number"
                value={window.width}
                onChange={(e) => updateWindow(index, 'width', parseInt(e.target.value) || 0)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor={`window-height-${index}`} className="text-sm font-medium">Wysokość (cm)</Label>
              <Input
                id={`window-height-${index}`}
                type="number"
                value={window.height}
                onChange={(e) => updateWindow(index, 'height', parseInt(e.target.value) || 0)}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Pozycja</Label>
              <Select value={window.position} onValueChange={(value) => updateWindow(index, 'position', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="front">Przód</SelectItem>
                  <SelectItem value="back">Tył</SelectItem>
                  <SelectItem value="left">Lewa</SelectItem>
                  <SelectItem value="right">Prawa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">
                Przesunięcie poziome: {window.offsetX}cm
              </Label>
              <Slider
                value={[window.offsetX]}
                onValueChange={([value]) => updateWindow(index, 'offsetX', value)}
                max={getMaxOffset(window.position, window.width)}
                min={0}
                step={5}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">
                Przesunięcie pionowe: {window.offsetY}cm
              </Label>
                <Slider
                  value={[window.offsetY]}
                  onValueChange={([value]) => updateWindow(index, 'offsetY', value)}
                  max={dimensions.height - window.height}
                  min={0}
                  step={5}
                  className="mt-2"
                />
            </div>
          </div>
        ))}
      </div>

      <Separator />

      {/* Canopy */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label className="text-sm font-medium">Wiata</Label>
          <div className="flex items-center space-x-2">
            <Switch
              checked={dimensions.canopy.enabled}
              onCheckedChange={(checked) => {
                updateDimension('canopy', {
                  ...dimensions.canopy,
                  enabled: checked
                });
              }}
            />
            <Label className="text-sm font-medium">Włączona</Label>
          </div>
        </div>

        {dimensions.canopy.enabled && (
          <div className="p-4 border rounded-lg space-y-3">
            <div>
              <Label htmlFor="canopy-width" className="text-sm font-medium">Szerokość (cm)</Label>
              <Input
                id="canopy-width"
                type="number"
                value={dimensions.canopy.width}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  updateDimension('canopy', {
                    ...dimensions.canopy,
                    width: value
                  });
                }}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="canopy-depth" className="text-sm font-medium">Głębokość (cm)</Label>
              <Input
                id="canopy-depth"
                type="number"
                value={dimensions.canopy.depth}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  updateDimension('canopy', {
                    ...dimensions.canopy,
                    depth: value
                  });
                }}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Pozycja</Label>
              <Select
                value={dimensions.canopy.position}
                onValueChange={(value) => {
                  updateDimension('canopy', {
                    ...dimensions.canopy,
                    position: value
                  });
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="front">Z przodu</SelectItem>
                  <SelectItem value="back">Z tyłu</SelectItem>
                  <SelectItem value="left">Z lewej</SelectItem>
                  <SelectItem value="right">Z prawej</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="canopy-offset-x" className="text-sm font-medium">Przesunięcie X (cm)</Label>
              <Input
                id="canopy-offset-x"
                type="number"
                value={dimensions.canopy.offsetX}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  if (value >= 0 && value <= getMaxOffset(dimensions.canopy.position, dimensions.canopy.width)) {
                    updateDimension('canopy', {
                      ...dimensions.canopy,
                      offsetX: value
                    });
                  }
                }}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="canopy-offset-y" className="text-sm font-medium">Przesunięcie Y (cm)</Label>
              <Input
                id="canopy-offset-y"
                type="number"
                value={dimensions.canopy.offsetY}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  if (value >= 0 && value <= dimensions.height) {
                    updateDimension('canopy', {
                      ...dimensions.canopy,
                      offsetY: value
                    });
                  }
                }}
                className="mt-1"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
