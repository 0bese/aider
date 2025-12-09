import { Text } from "@/components/ui/text";
import { ScrollView } from "react-native-gesture-handler";

export default function SettingsPage() {
  return (
    <ScrollView
    className="flex-1"
    contentInsetAdjustmentBehavior="automatic"
    >
      <Text>Settings page</Text>
    </ScrollView>
  );
}
