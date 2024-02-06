type Box = {
    x: number;
    y: number;
    width: number;
    height: number;
};

type FrameProcessorResult = Array<{
    uuid: string;
    confidence: number;
    label: string;
    box: Box;
    color: string;
}>;

