import { Dimensions } from 'react-native';
import { runOnJS } from 'react-native-reanimated';
import { Frame, useFrameProcessor } from 'react-native-vision-camera';

const windowDims = Dimensions.get('window');

const getRandomColor = () => {
  'worklet'

  return '#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0')
};

const processBoxCoordinates = (frame: Frame, box: Box) => {
  'worklet'

  const scaleX = frame.width / windowDims.width;
  const scaleY = frame.height / windowDims.height;
  const updated = {
    x: box.x / scaleX,
    y: box.y / scaleY,
    width: box.width / scaleX,
    height: box.height / scaleY,
  };

  return updated;
};

export function detectPkLot(frame: Frame) {
  'worklet'

  /* @ts-ignore */
  return __pklotDetect(frame);
}

export const usePkLotFrameProcessor = (
  setData: (data: any) => void
) => useFrameProcessor((frame) => {
  'worklet'

  const res = detectPkLot(frame);
  const resProcessed = res.map((r: any) => ({
    ...r,
    box: processBoxCoordinates(frame, r.box),
    color: getRandomColor(),
  }));

  runOnJS(setData)(resProcessed);
}, []);
