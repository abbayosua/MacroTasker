import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useMacroStore } from '@/store/macros';
import { useLogStore } from '@/store/logs';
import { macroEngine } from '@/engine/MacroEngine';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function MacrosScreen() {
  const { macros, loadMacros, toggleMacro, deleteMacro } = useMacroStore();
  const colorScheme = useColorScheme();
  const [permissionGranted, setPermissionGranted] = useState(false);
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    loadMacros();
    macroEngine.initialize();
    checkPermission();

    return () => macroEngine.cleanup();
  }, []);

  const checkPermission = async () => {
    const granted = await macroEngine.checkNotificationPermission();
    setPermissionGranted(granted);
  };

  const requestPermission = () => {
    macroEngine.requestNotificationPermission();
    setTimeout(checkPermission, 1000);
  };

  const handleToggle = async (id: string) => {
    if (!permissionGranted) {
      Alert.alert(
        'Permission Required',
        'Please grant Notification Access permission first.',
        [{ text: 'OK' }, { text: 'Grant', onPress: requestPermission }]
      );
      return;
    }
    await toggleMacro(id);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Macro', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMacro(id) },
    ]);
  };

  const renderMacro = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.macroCard, { backgroundColor: colors.card }]}
      onPress={() => router.push(`/macro/${item.id}`)}>
      <View style={styles.macroInfo}>
        <Text style={[styles.macroName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.macroTriggers, { color: colors.textSecondary }]}>
          {item.triggers.length} trigger(s) → {item.actions.length} action(s)
        </Text>
      </View>
      <View style={styles.macroActions}>
        <TouchableOpacity
          style={[styles.toggleBtn, { backgroundColor: item.enabled ? '#4CAF50' : '#ccc' }]}
          onPress={() => handleToggle(item.id)}>
          <Text style={styles.toggleText}>{item.enabled ? 'ON' : 'OFF'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
          <IconSymbol size={20} name="trash" color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {!permissionGranted && (
        <TouchableOpacity
          style={[styles.permissionBanner, { backgroundColor: '#FFF3E0' }]}
          onPress={requestPermission}>
          <Text style={styles.permissionText}>
            ⚠️ Tap to grant Notification Access permission
          </Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={macros}
        keyExtractor={(item) => item.id}
        renderItem={renderMacro}
        ListEmptyComponent={
          <View style={styles.empty}>
            <IconSymbol size={64} name="list.bullet" color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No macros yet
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Tap + to create your first automation
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.tint }]}
        onPress={() => router.push('/macro/create')}>
        <IconSymbol size={28} name="plus" color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  permissionBanner: {
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  permissionText: { fontSize: 14, fontWeight: '600', color: '#E65100' },
  macroCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
  },
  macroInfo: { flex: 1 },
  macroName: { fontSize: 16, fontWeight: '600' },
  macroTriggers: { fontSize: 12, marginTop: 4 },
  macroActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  toggleText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  deleteBtn: { padding: 8 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { fontSize: 18, fontWeight: '600', marginTop: 16 },
  emptySubtext: { fontSize: 14, marginTop: 8 },
});
