import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useMacroStore } from '@/store/macros';
import { useLogStore } from '@/store/logs';
import { Macro, LogEntry } from '@/types';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function MacroDetailScreen() {
  const { id } = useLocalSearchParams();
  const getMacro = useMacroStore((state) => state.getMacro);
  const getLogsByMacro = useLogStore((state) => state.getLogsByMacro);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [macro, setMacro] = useState<Macro | undefined>();
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    if (id) {
      const m = getMacro(id as string);
      setMacro(m);
      if (m) setLogs(getLogsByMacro(id as string));
    }
  }, [id]);

  if (!macro) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Macro not found</Text>
      </View>
    );
  }

  const trigger = macro.triggers[0];
  const action = macro.actions[0];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{macro.name}</Text>
        <Text style={[styles.status, { color: macro.enabled ? '#4CAF50' : '#999' }]}>
          {macro.enabled ? 'Enabled' : 'Disabled'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Trigger</Text>
        <View style={[styles.configCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.configLabel, { color: colors.text }]}>Type</Text>
          <Text style={[styles.configValue, { color: colors.text }]}>
            Notification Received
          </Text>
          {trigger && (trigger.config as any).packageFilter && (
            <>
              <Text style={[styles.configLabel, { color: colors.text, marginTop: 8 }]}>
                Package Filter
              </Text>
              <Text style={[styles.configValue, { color: colors.text }]}>
                {(trigger.config as any).packageFilter}
              </Text>
            </>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Action</Text>
        <View style={[styles.configCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.configLabel, { color: colors.text }]}>Type</Text>
          <Text style={[styles.configValue, { color: colors.text }]}>HTTP Request</Text>
          {action && (
            <>
              <Text style={[styles.configLabel, { color: colors.text, marginTop: 8 }]}>
                Method
              </Text>
              <Text style={[styles.configValue, { color: colors.text }]}>
                {(action.config as any).method}
              </Text>
              <Text style={[styles.configLabel, { color: colors.text, marginTop: 8 }]}>
                URL
              </Text>
              <Text style={[styles.configValue, { color: colors.text }]} numberOfLines={2}>
                {(action.config as any).url}
              </Text>
            </>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Recent Logs ({logs.length})
        </Text>
        {logs.slice(0, 10).map((log) => (
          <View key={log.id} style={[styles.logCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.logStatus, { color: log.status === 'success' ? '#4CAF50' : '#F44336' }]}>
              {log.status}
            </Text>
            <Text style={[styles.logTime, { color: colors.textSecondary }]}>
              {new Date(log.timestamp).toLocaleString()}
            </Text>
            {log.error && (
              <Text style={[styles.logError, { color: '#F44336' }]}>{log.error}</Text>
            )}
          </View>
        ))}
        {logs.length === 0 && (
          <Text style={[styles.noLogs, { color: colors.textSecondary }]}>
            No executions yet
          </Text>
        )}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.editBtn, { borderColor: colors.tint }]}
          onPress={() => router.push(`/macro/create?id=${macro.id}`)}>
          <Text style={[styles.editBtnText, { color: colors.tint }]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.tint }]}
          onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Done</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  status: { fontSize: 14, fontWeight: '600' },
  configCard: { padding: 16, borderRadius: 8 },
  configLabel: { fontSize: 12, fontWeight: '600' },
  configValue: { fontSize: 16, marginTop: 2 },
  logCard: { padding: 12, borderRadius: 8, marginBottom: 8 },
  logStatus: { fontSize: 12, fontWeight: '700' },
  logTime: { fontSize: 12, marginTop: 2 },
  logError: { fontSize: 12, marginTop: 4 },
  noLogs: { fontSize: 14, fontStyle: 'italic' },
  buttonRow: { flexDirection: 'row', gap: 12, marginBottom: 40 },
  editBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  editBtnText: { fontSize: 16, fontWeight: '700' },
  backBtn: { flex: 1, padding: 14, borderRadius: 12, alignItems: 'center' },
  backBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
