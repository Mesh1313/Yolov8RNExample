import { StyleSheet, View } from "react-native";
import Camera from "./src/components/Camera/Camera";
import { SafeAreaProvider } from "react-native-safe-area-context";

function App() {
  return (
    <View style={styles.container}>
      <Camera />
    </View>
  );
}

export default (props: any) => {
  return (
    <SafeAreaProvider>
      <App {...props} />
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
