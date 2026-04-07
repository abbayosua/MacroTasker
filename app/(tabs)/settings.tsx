import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { macroEngine } from '@/engine/MacroEngine';
import { useLogStore } from '@/store/logs';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SettingsScreen() {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { clearLogs } = useLogStore();

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    const granted = await macroEngine.checkNotificationPermission();
    setPermissionGranted(granted);
  };

  const requestPermission = () => {
    macroEngine.requestNotificationPermission();
    setTimeout(checkPermission, 1000);
  };

  const handleClearLogs = () => {
    Alert.alert('Clear Logs', 'Are you sure you want to delete all logs?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => clearLogs() },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Settings</Text>

      <TouchableOpacity
        style={[styles.settingCard, { backgroundColor: colors.card }]}
        onPress={requestPermission}>
        <View style={styles.settingInfo}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>
            Notification Access
          </Text>
          <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
            Required to detect notifications from other apps
          </Text>
        </View>
        <Text
          style={[
            styles.settingStatus,
            { color: permissionGranted ? '#4CAF50' : '#F44336' },
          ]}>
          {permissionGranted ? 'Granted' : 'Not Granted'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.settingCard, { backgroundColor: colors.card }]}
        onPress={handleClearLogs}>
        <View style={styles.settingInfo}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>
            Clear Execution Logs
          </Text>
          <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
            Delete all macro execution history
          </Text>
        </View>
        <Text style={[styles.settingAction, { color: colors.tint }]}>Clear</Text>
      </TouchableOpacity>

      <View style={styles.aboutSection}>
        <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
          MacroTasker v0.1.0 (MVP)
        </Text>
        <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
          Notification → HTTP Request
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 24 },
  settingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingInfo: { flex: 1 },
  settingTitle: { fontSize: 16, fontWeight: '600' },
  settingDesc: { fontSize: 12, marginTop: 4 },
  settingStatus: { fontSize: 14, fontWeight: '600' },
  settingAction: { fontSize: 16, fontWeight: '600' },
  aboutSection: { marginTop: 40, alignItems: 'center' },
  aboutText: { fontSize: 14 },
});
