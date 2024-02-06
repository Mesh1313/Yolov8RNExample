import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
	CameraRuntimeError,
	useCameraDevices,
	Camera as VCamera
} from "react-native-vision-camera";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { usePkLotFrameProcessor } from "../../utils/pkLotFrameProcessor";

const RecognizedObjectBoxes = (
	{
		data,
	}: {
		data: FrameProcessorResult
	}
) => {
	return (
		<View style={styles.boxesContainer}>
			{data.map((item) => (
				<View
					key={`${item.label}-${item.box.x + item.box.y}`}
					style={[
						styles.box,
						{
							top: item.box.y,
							left: item.box.x,
							width: item.box.width,
							height: item.box.height,
							borderColor: item.color,
						},
					]}
				/>
			))}
		</View>
	);
};

const ResultsTable = ({ data }: { data: FrameProcessorResult }) => {
	const insets = useSafeAreaInsets();

	return data?.length > 0 && (
		<View style={[styles.resultsTable, { paddingBottom: insets.bottom }]}>
			{data.map(d => (
				<View
					key={`${d.label}-${d.box.x + d.box.y}`}
					style={styles.resultTableRow}>
					<Text>
						{d.confidence} {d.label}
					</Text>
				</View>
			))}
		</View>
	);
};

const Camera = () => {
	const [hasPermission, setHasPermission] = useState(false);
	const requestCameraPermission = useCallback(async () => {
		const permission = await VCamera.requestCameraPermission();
	
		setHasPermission(permission === 'authorized');
	}, []);

	const devices = useCameraDevices();
	const device = devices['back'];

	const [fpData, setFpData] = useState<FrameProcessorResult>([]);
	const frameProcessor = usePkLotFrameProcessor(setFpData);

	// Camera callbacks
  const onError = useCallback((error: CameraRuntimeError) => {
    console.error('Camera Error: ', error);
  }, [])

	useEffect(() => {
		if (!hasPermission) {
			requestCameraPermission();
		}
	}, []);

	if (!hasPermission) return null;
  if (device == null) return null;

	return (
		<View style={styles.container}>
			<VCamera
				style={StyleSheet.absoluteFill}
				device={device}
				isActive={true}
				orientation="portrait"
				onError={onError}
				frameProcessor={frameProcessor}
				frameProcessorFps={10}
				zoom={device.neutralZoom}
			/>
			<RecognizedObjectBoxes data={fpData} />

			<ResultsTable data={fpData} />
		</View>
	);
};

export default Camera;

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	boxesContainer: {
		...StyleSheet.absoluteFillObject,
	},
	box: {
		borderWidth: 2,
		borderColor: 'orange',
		position: 'absolute',
	},
	resultsTable: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		backgroundColor: '#b5b5b5',
	},
	resultTableRow: {
		padding: 4,
		borderBottomWidth: 1,
		borderColor: '#151515'
	},
});
