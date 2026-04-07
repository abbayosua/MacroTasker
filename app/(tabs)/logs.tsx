import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useEffect } from 'react';
import { useLogStore } from '@/store/logs';
import { useMacroStore } from '@/store/macros';
import { LogEntry } from '@/types';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function LogsScreen() {
  const { logs } = useLogStore();
  const { macros } = useMacroStore();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const getMacroName = (macroId: string) => {
    return macros.find((m) => m.id === macroId)?.name || 'Unknown';
  };

  const formatTimestamp = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleString();
  };

  const renderLog = ({ item }: { item: LogEntry }) => (
    <View style={[styles.logCard, { backgroundColor: colors.card }]}>
      <View style={styles.logHeader}>
        <Text style={[styles.logMacroName, { color: colors.text }]}>
          {getMacroName(item.macroId)}
        </Text>
        <Text
          style={[
            styles.logStatus,
            { color: item.status === 'success' ? '#4CAF50' : '#F44336' },
          ]}>
          {item.status.toUpperCase()}
        </Text>
      </View>
      <Text style={[styles.logTime, { color: colors.textSecondary }]}>
        {formatTimestamp(item.timestamp)}
      </Text>
      <Text style={[styles.logDetails, { color: colors.textSecondary }]}>
        {item.actionsExecuted} action(s) executed • {item.duration}ms
      </Text>
      {item.error && (
        <Text style={[styles.logError, { color: '#F44336' }]}>{item.error}</Text>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        renderItem={renderLog}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No logs yet
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Execution history will appear here
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  logCard: {
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logMacroName: { fontSize: 16, fontWeight: '600' },
  logStatus: { fontSize: 12, fontWeight: '700' },
  logTime: { fontSize: 12, marginTop: 4 },
  logDetails: { fontSize: 12, marginTop: 2 },
  logError: { fontSize: 12, marginTop: 8 },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 18, fontWeight: '600' },
  emptySubtext: { fontSize: 14, marginTop: 8 },
});
